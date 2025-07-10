import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import {
  Product,
  ProductDocument,
  ProductViewDocument,
  ProductViews,
} from './schemas/product.model';
import { Brand, BrandDocument } from '../brand/schemas/brand.schema';
import { Category, CategoryDocument } from '../category/schemas/category.schema';
import {
  GetProductDto,
  GetProductsListForFrontDto,
  SearchProductsDto,
} from './dto/product.dto';
import { buildProductPipeline, buildOneProductPipeline } from 'src/common/helpers/pipelines/product-pipeline';
import { universalSearchQuery } from 'src/common/helpers/universal-search-query';
import { BuildCategoryHierarchyService } from 'src/shared/services/build-hierarchy.service';
import { SearchService } from '../elasticsearch/elasticsearch.service';
import { CACHE_TAGS } from '../../common/decorators/cache.decorator';

@Injectable()
export class ProductServiceOptimized {
  private viewUpdateQueue = new Map<string, Set<string>>();
  private viewUpdateTimer: NodeJS.Timeout | null = null;
  private popularProductsCache = new Map<string, any>();

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductViews.name)
    private readonly productViewModel: Model<ProductViewDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly buildCategoryHierarchyService: BuildCategoryHierarchyService,
    private readonly elasticSearchService: SearchService,
  ) {
    // Initialize view update processing
    this.initializeViewUpdateProcessor();
  }

  private initializeViewUpdateProcessor() {
    // Process view updates every 30 seconds
    this.viewUpdateTimer = setInterval(() => {
      this.processViewUpdateQueue();
    }, 30000);
  }

  async searchProductsOptimized(body: SearchProductsDto, lang: string) {
    const cacheKey = `${CACHE_TAGS.SEARCH}:${JSON.stringify(body)}:${lang}`;
    
    try {
      // Try to get from cache first
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Use Elasticsearch as primary search engine
      const result = await this.searchProducts(body, lang);
      
      // Cache the result for 5 minutes
      await this.cacheManager.set(cacheKey, result, 300);
      
      return result;
    } catch (error) {
      console.error('Search error, falling back to MongoDB:', error);
      // Fallback to MongoDB search
      return this.searchProductsWithMongoDB(body, lang);
    }
  }

  async searchProducts(body: SearchProductsDto, lang: string) {
    let sort: Record<string, 1 | -1> = { createdAt: -1, views: -1 };
    const search = true;
    const skip = body.page ? (body.page - 1) * (body.limit || 12) : 0;
    const limit = body.limit || 12;

    // Use Elasticsearch for search
    const searchResults = await this.elasticSearchService.search(
      body,
      lang,
      skip,
      limit,
    );

    if (!searchResults.hits.length) {
      return { data: [], pages: 0, total: 0 };
    }

    const productIds = searchResults.hits.map(
      (hit) => new Types.ObjectId(hit._id),
    );

    const match = {
      isDeleted: false,
      _id: { $in: productIds },
    };

    // Use optimized pipeline with proper indexing
    const pipeline = await buildProductPipeline(
      match,
      sort,
      lang,
      limit,
      skip,
      search,
      productIds,
    );

    // Execute queries in parallel for better performance
    const [data, total] = await Promise.all([
      this.productModel.aggregate(pipeline).exec(),
      productIds.length, // Use search result count instead of expensive countDocuments
    ]);

    const pages = Math.ceil(total / limit);
    return { data, pages, total };
  }

  async getProductsListForFrontOptimized(
    body: GetProductsListForFrontDto,
    lang: string,
  ) {
    const cacheKey = `${CACHE_TAGS.PRODUCTS}:list:${JSON.stringify(body)}:${lang}`;
    
    try {
      // Check cache first
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await this.getProductsListForFront(body, lang);
      
      // Cache for 10 minutes
      await this.cacheManager.set(cacheKey, result, 600);
      
      return result;
    } catch (error) {
      console.error('Error getting products list:', error);
      return { data: [], total: 0, pages: 0, hierarchy: [] };
    }
  }

  async getProductsListForFront(body: GetProductsListForFrontDto, lang: string) {
    const { category, brands } = body;
    let sort: Record<string, 1 | -1> = { createdAt: -1, views: -1 };
    const limit = body.limit || 12;
    const skip = body.page ? (body.page - 1) * limit : 0;
    let hierarchy: any[] = [];

    const match: any = { isDeleted: false, status: 1 };

    // Optimize category lookup with caching
    if (category) {
      const categoryKey = `${CACHE_TAGS.CATEGORIES}:${category}:${lang}`;
      let findCategory = await this.cacheManager.get(categoryKey);
      
      if (!findCategory) {
        findCategory = await this.categoryModel
          .findOne({ [`slug${lang}`]: category })
          .lean();
        
        if (findCategory) {
          await this.cacheManager.set(categoryKey, findCategory, 600);
        }
      }

      if (!findCategory) {
        return { data: [], total: 0, pages: 0, hierarchy: [] };
      }

      hierarchy = findCategory.hierarchy?.map((item: any) => ({
        categoryId: item.categoryId,
        categorySlug: item[`categorySlug${lang}`],
        categoryName: item[`categoryName${lang}`],
      })) || [];

      match.hierarchyPath = findCategory._id.toString();
    }

    // Optimize brand lookup with caching
    if (brands?.length) {
      const brandKey = `${CACHE_TAGS.BRANDS}:${brands.join(',')}`;
      let brandIds = await this.cacheManager.get(brandKey);
      
      if (!brandIds) {
        brandIds = await this.brandModel
          .find({ slug: { $in: brands } })
          .distinct('_id');
        
        if (brandIds?.length) {
          await this.cacheManager.set(brandKey, brandIds, 600);
        }
      }

      if (!brandIds?.length) {
        return { data: [], total: 0, pages: 0, hierarchy: [] };
      }

      match.brandId = { $in: brandIds };
    }

    const pipeline = await buildProductPipeline(match, sort, lang, limit, skip);
    
    // Execute in parallel
    const [data, total] = await Promise.all([
      this.productModel.aggregate(pipeline).exec(),
      this.productModel.countDocuments(match),
    ]);

    const pages = Math.ceil(total / limit);
    return { data, total, pages, hierarchy };
  }

  async getProductForFrontOptimized(
    body: GetProductDto,
    req: Request,
    lang: string,
  ) {
    if (!body.slug) {
      return {};
    }

    const cacheKey = `${CACHE_TAGS.PRODUCTS}:${body.slug}:${lang}`;
    
    try {
      // Check cache first
      let product = await this.cacheManager.get(cacheKey);
      
      if (!product) {
        const searchableFields = ['slugUz', 'slugRu', 'slugEn'];
        const filter = await universalSearchQuery(body.slug, searchableFields);
        
        const findProduct = await this.productModel.findOne(filter).lean();
        if (!findProduct) {
          return {};
        }

        const pipeline = await buildOneProductPipeline(filter, lang);
        const data = await this.productModel.aggregate(pipeline).exec();
        product = data.length ? data[0] : null;
        
        if (product) {
          // Cache for 15 minutes
          await this.cacheManager.set(cacheKey, product, 900);
        }
      }

      // Track views asynchronously (non-blocking)
      if (product) {
        const ip = req.ip;
        this.updateProductViewsOptimized(product._id.toString(), ip);
      }

      return product;
    } catch (error) {
      console.error('Error getting product for front:', error);
      return {};
    }
  }

  async updateProductViewsOptimized(productId: string, ip: string) {
    if (!this.viewUpdateQueue.has(productId)) {
      this.viewUpdateQueue.set(productId, new Set());
    }
    
    this.viewUpdateQueue.get(productId)!.add(ip);
  }

  private async processViewUpdateQueue() {
    if (this.viewUpdateQueue.size === 0) {
      return;
    }

    const updates: any[] = [];
    const viewUpdates: any[] = [];

    for (const [productId, ips] of this.viewUpdateQueue.entries()) {
      if (ips.size > 0) {
        // Batch product view updates
        updates.push({
          updateOne: {
            filter: { _id: productId },
            update: { $inc: { views: ips.size } },
          },
        });

        // Batch product view tracking updates
        viewUpdates.push({
          updateOne: {
            filter: { productId },
            update: { $addToSet: { ips: { $each: Array.from(ips) } } },
            upsert: true,
          },
        });
      }
    }

    try {
      // Execute batch updates in parallel
      await Promise.all([
        updates.length > 0 ? this.productModel.bulkWrite(updates) : Promise.resolve(),
        viewUpdates.length > 0 ? this.productViewModel.bulkWrite(viewUpdates) : Promise.resolve(),
      ]);

      // Clear the queue after successful update
      this.viewUpdateQueue.clear();
    } catch (error) {
      console.error('Error processing view update queue:', error);
    }
  }

  async getPopularProductsOptimized(lang: string, limit: number = 10) {
    const cacheKey = `${CACHE_TAGS.PRODUCTS}:popular:${lang}:${limit}`;
    
    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      const pipeline = await buildProductPipeline(
        { isDeleted: false, status: 1 },
        { views: -1, createdAt: -1 },
        lang,
        limit,
        0,
      );

      const data = await this.productModel.aggregate(pipeline).exec();
      
      // Cache for 1 hour
      await this.cacheManager.set(cacheKey, data, 3600);
      
      return data;
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }

  async invalidateProductCache(productId?: string) {
    try {
      if (productId) {
        // Invalidate specific product caches
        const keys = [
          `${CACHE_TAGS.PRODUCTS}:*${productId}*`,
          `${CACHE_TAGS.SEARCH}:*`,
        ];
        
        for (const pattern of keys) {
          // Note: This would require a cache implementation that supports pattern-based deletion
          // For now, we'll just clear the entire cache namespace
          await this.cacheManager.del(pattern);
        }
      } else {
        // Clear all product-related caches
        await this.cacheManager.reset();
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  // Cleanup method for graceful shutdown
  onModuleDestroy() {
    if (this.viewUpdateTimer) {
      clearInterval(this.viewUpdateTimer);
      // Process any remaining updates
      this.processViewUpdateQueue();
    }
  }
}