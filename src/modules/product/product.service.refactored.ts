import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';

import { Product, ProductDocument } from './schemas/product.model';
import { 
  GetProductDto, 
  GetProductsListDto, 
  GetProductsListForFrontDto,
  AddProductDto,
  UpdateProductDto,
  DeleteProductDto,
} from './dto/product.dto';

import { ErrorHandlingService } from '../../common/services/error-handling.service';
import { EntityValidationService } from '../../common/services/entity-validation.service';
import { PAGINATION_CONSTANTS, DATABASE_CONSTANTS } from '../../common/constants/application.constants';

// Interfaces for better type safety
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}

interface ProductListOptions {
  page?: number;
  limit?: number;
  category?: string;
  brands?: string[];
  language: string;
}

interface CreateProductResult {
  productId: string;
  sku: string;
  success: boolean;
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly errorHandler: ErrorHandlingService,
    private readonly entityValidator: EntityValidationService,
    // Injected services instead of direct dependencies
    private readonly productSearchService: ProductSearchService,
    private readonly productAnalyticsService: ProductAnalyticsService,
    private readonly productIndexingService: ProductIndexingService,
    private readonly thumbnailService: ThumbnailService,
    private readonly categoryHierarchyService: CategoryHierarchyService,
  ) {}

  /**
   * Get a single product by ID or slug
   * Returns null if not found (no empty objects)
   */
  async getProductById(productId: string): Promise<Product | null> {
    this.errorHandler.validateObjectId(productId, 'Product');
    
    try {
      const product = await this.productModel
        .findById(productId)
        .where(DATABASE_CONSTANTS.SOFT_DELETE_FIELD, false)
        .lean();
        
      return product || null;
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'get product', 'ProductService.getProductById');
    }
  }

  /**
   * Get product by slug for frontend display
   * Includes view tracking
   */
  async getProductForDisplay(
    slug: string, 
    language: string, 
    request: Request
  ): Promise<Product | null> {
    this.errorHandler.validateRequiredField(slug, 'Product slug');
    this.errorHandler.validateLanguage(language);

    try {
      const productSummary = await this.entityValidator.validateProductBySlug(slug, language);
      const product = await this.getProductWithDetails(productSummary.productId, language);
      
      if (product) {
        // Track view asynchronously (non-blocking)
        this.trackProductView(product._id.toString(), request.ip);
      }
      
      return product;
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'get product for display', 'ProductService.getProductForDisplay');
    }
  }

  /**
   * Get paginated product list for frontend
   */
  async getProductListForFrontend(options: ProductListOptions): Promise<PaginatedResponse<Product>> {
    const { page, limit } = this.errorHandler.validatePaginationParams(options.page, options.limit);
    this.errorHandler.validateLanguage(options.language);

    try {
      const filters = await this.buildProductFilters(options);
      const products = await this.executeProductQuery(filters, { page, limit }, options.language);
      
      return this.formatPaginatedResponse(products, page, limit);
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'get product list for frontend', 'ProductService.getProductListForFrontend');
    }
  }

  /**
   * Get paginated product list for admin panel
   */
  async getProductListForAdmin(options: GetProductsListDto): Promise<PaginatedResponse<Product>> {
    const { page, limit } = this.errorHandler.validatePaginationParams(options.page, options.limit);

    try {
      const products = await this.getProductsWithUniversalQuery(options);
      return this.formatPaginatedResponse(products, page, limit);
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'get product list for admin', 'ProductService.getProductListForAdmin');
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: AddProductDto): Promise<CreateProductResult> {
    this.validateProductCreationData(productData);

    try {
      // Validate related entities
      await this.entityValidator.validateAndGetCategory(productData.categoryId);

      // Generate unique identifiers
      const productMetadata = await this.generateProductMetadata(productData);
      
      // Process thumbnails if images are provided
      const thumbnails = productData.images?.length 
        ? await this.thumbnailService.generateThumbnails(productData.images)
        : [];

      // Build category hierarchy
      const hierarchy = await this.categoryHierarchyService.buildHierarchy(productData.categoryId);

      // Create product
      const productToCreate = {
        ...productData,
        ...productMetadata,
        thumbs: thumbnails,
        ...hierarchy,
      };

      const createdProduct = await this.productModel.create(productToCreate);
      
      // Index for search (asynchronous)
      this.indexProductAsync(createdProduct);

      this.logger.log(`Product created successfully: ${createdProduct._id}`);
      
      return {
        productId: createdProduct._id.toString(),
        sku: createdProduct.sku,
        success: true,
      };
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'create product', 'ProductService.createProduct');
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(updateData: UpdateProductDto): Promise<string[]> {
    this.errorHandler.validateObjectId(updateData._id, 'Product');

    try {
      // Verify product exists
      const existingProduct = await this.getProductById(updateData._id);
      if (!existingProduct) {
        this.errorHandler.handleNotFound('Product', updateData._id);
      }

      // Build update object
      const updateObject = await this.buildProductUpdateObject(updateData);
      
      // Update product
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        updateData._id,
        { $set: updateObject },
        { new: true, lean: true }
      );

      // Update search index (asynchronous)
      this.updateProductIndexAsync(updatedProduct);

      this.logger.log(`Product updated successfully: ${updateData._id}`);
      
      return updatedProduct.thumbs || [];
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'update product', 'ProductService.updateProduct');
    }
  }

  /**
   * Soft delete a product
   */
  async deleteProduct(productId: string): Promise<void> {
    this.errorHandler.validateObjectId(productId, 'Product');

    try {
      const product = await this.getProductById(productId);
      if (!product) {
        this.errorHandler.handleNotFound('Product', productId);
      }

      await this.productModel.updateOne(
        { _id: productId },
        { [DATABASE_CONSTANTS.SOFT_DELETE_FIELD]: true }
      );

      // Remove from search index (asynchronous)
      this.removeProductFromIndexAsync(productId);

      this.logger.log(`Product deleted successfully: ${productId}`);
    } catch (error) {
      this.errorHandler.handleServiceError(error, 'delete product', 'ProductService.deleteProduct');
    }
  }

  // Private helper methods

  /**
   * Validate product creation data
   */
  private validateProductCreationData(data: AddProductDto): void {
    this.errorHandler.validateRequiredField(data.nameUz, 'Product name (Uzbek)');
    this.errorHandler.validateRequiredField(data.nameRu, 'Product name (Russian)');
    this.errorHandler.validateRequiredField(data.nameEn, 'Product name (English)');
    this.errorHandler.validateRequiredField(data.categoryId, 'Category ID');
    
    if (data.currentPrice && data.currentPrice <= 0) {
      this.errorHandler.handleValidationError('Product price must be greater than 0');
    }
  }

  /**
   * Generate product metadata (slugs, SKU)
   */
  private async generateProductMetadata(data: AddProductDto): Promise<{
    slugUz: string;
    slugRu: string;
    slugEn: string;
    sku: string;
  }> {
    return {
      slugUz: await this.generateUniqueSlug(data.nameUz),
      slugRu: await this.generateUniqueSlug(data.nameRu),
      slugEn: await this.generateUniqueSlug(data.nameEn),
      sku: await this.generateUniqueSKU(),
    };
  }

  /**
   * Build product filters for queries
   */
  private async buildProductFilters(options: ProductListOptions): Promise<any> {
    const filters: any = {
      [DATABASE_CONSTANTS.SOFT_DELETE_FIELD]: false,
      status: DATABASE_CONSTANTS.STATUS_ACTIVE,
    };

    if (options.category) {
      const category = await this.entityValidator.validateCategoryBySlug(options.category, options.language);
      filters.hierarchyPath = category.hierarchyPath;
    }

    if (options.brands?.length) {
      const brandIds = await this.getBrandIdsBySlug(options.brands);
      filters.brandId = { $in: brandIds };
    }

    return filters;
  }

  /**
   * Execute product query with pagination
   */
  private async executeProductQuery(
    filters: any, 
    pagination: { page: number; limit: number },
    language: string
  ): Promise<{ data: Product[]; total: number }> {
    const skip = (pagination.page - 1) * pagination.limit;
    
    const [products, total] = await Promise.all([
      this.productModel
        .find(filters)
        .sort({ createdAt: -1, views: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      this.productModel.countDocuments(filters),
    ]);

    return { data: products, total };
  }

  /**
   * Format response with pagination metadata
   */
  private formatPaginatedResponse<T>(
    result: { data: T[]; total: number },
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    return {
      data: result.data,
      total: result.total,
      pages: Math.ceil(result.total / limit),
      currentPage: page,
    };
  }

  /**
   * Track product view asynchronously
   */
  private trackProductView(productId: string, ipAddress: string): void {
    // Delegate to analytics service (non-blocking)
    this.productAnalyticsService.trackView(productId, ipAddress)
      .catch(error => {
        this.errorHandler.logSoftError('Failed to track product view', error, 'ProductService.trackProductView');
      });
  }

  /**
   * Index product for search asynchronously
   */
  private indexProductAsync(product: Product): void {
    this.productIndexingService.indexProduct(product)
      .catch(error => {
        this.errorHandler.logSoftError('Failed to index product', error, 'ProductService.indexProductAsync');
      });
  }

  /**
   * Update product in search index asynchronously
   */
  private updateProductIndexAsync(product: Product): void {
    this.productIndexingService.updateProduct(product)
      .catch(error => {
        this.errorHandler.logSoftError('Failed to update product index', error, 'ProductService.updateProductIndexAsync');
      });
  }

  /**
   * Remove product from search index asynchronously
   */
  private removeProductFromIndexAsync(productId: string): void {
    this.productIndexingService.removeProduct(productId)
      .catch(error => {
        this.errorHandler.logSoftError('Failed to remove product from index', error, 'ProductService.removeProductFromIndexAsync');
      });
  }

  // Additional private helper methods would go here...
  private async generateUniqueSlug(name: string): Promise<string> {
    // Implementation for slug generation
    return '';
  }

  private async generateUniqueSKU(): Promise<string> {
    // Implementation for SKU generation
    return '';
  }

  private async getBrandIdsBySlug(slugs: string[]): Promise<string[]> {
    // Implementation for brand ID lookup
    return [];
  }

  private async getProductWithDetails(productId: string, language: string): Promise<Product | null> {
    // Implementation for detailed product query
    return null;
  }

  private async buildProductUpdateObject(updateData: UpdateProductDto): Promise<any> {
    // Implementation for building update object
    return {};
  }

  private async getProductsWithUniversalQuery(options: GetProductsListDto): Promise<{ data: Product[]; total: number }> {
    // Implementation for admin query
    return { data: [], total: 0 };
  }
}

// Separate services that would be implemented
interface ProductSearchService {
  searchProducts(criteria: any): Promise<any>;
}

interface ProductAnalyticsService {
  trackView(productId: string, ipAddress: string): Promise<void>;
}

interface ProductIndexingService {
  indexProduct(product: Product): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  removeProduct(productId: string): Promise<void>;
}

interface ThumbnailService {
  generateThumbnails(images: string[]): Promise<string[]>;
}

interface CategoryHierarchyService {
  buildHierarchy(categoryId: string): Promise<any>;
}