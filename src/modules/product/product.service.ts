import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import {
  Product,
  ProductDocument,
  ProductViewDocument,
  ProductViews,
} from './schemas/product.model';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';
import { generateUniqueSlugForProduct } from 'src/common/helpers/generate-slug';
import { Brand, BrandDocument } from '../brand/schemas/brand.schema';
import {
  buildOneProductPipeline,
  buildProductPipeline,
} from 'src/common/helpers/pipelines/product-pipeline';
import { generateUniqueSKU } from 'src/common/helpers/generate-sku';
import { universalSearchQuery } from 'src/common/helpers/universal-search-query';
import { BuildCategoryHierarchyService } from 'src/shared/services/build-hierarchy.service';
import {
  Category,
  CategoryDocument,
} from '../category/schemas/category.schema';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductDto,
  GetProductsListDto,
  GetProductsListForFrontDto,
  SearchProductsDto,
  UpdateProductDto,
} from './dto/product.dto';
import {
  AddingModelException,
  ModelDataNotFoundByIdException,
} from 'src/common/errors/model/model-based.exceptions';
import { IHierarchyPayload } from 'src/shared/interfaces/hierarchy-payload';
import { FileMetadataDto } from '../../shared/dto/file-meta.dto';
import { generateThumbs } from 'src/common/helpers/generate-thumbs';
import { SearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductViews.name)
    private readonly productViewModel: Model<ProductViewDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    private readonly buildCategoryHierarchyService: BuildCategoryHierarchyService,
    private readonly elasticSearchService: SearchService,
  ) {}

  async uploadProductImages(body: any) {
    if (body.images) {
      body.thumbs = await generateThumbs(body.images);
    }

    if (body.imageName.length === 3) {
      body.imageName = `00${body.imageName}`;
    }

    const findProduct = await this.productModel.findOne({
      sku: body.imageName,
    });

    if (!findProduct) {
      return {
        status: 404,
        message: `Product not found with ${body.imageName}`,
      };
    }

    await this.productModel.findOneAndUpdate(
      { sku: body.imageName },
      {
        $set: {
          images: body.images,
          thumbs: body.thumbs,
        },
      },
    );

    return {
      status: 200,
      message: 'Updated succesfully',
    };
  }

  async searchProducts(body: SearchProductsDto, lang: string) {
    let sort: Record<string, 1 | -1> = { createdAt: -1, views: -1 };
    const search = true;
    const skip = body.page ? (body.page - 1) * (body.limit || 12) : 0;
    const limit = body.limit || 12;
    let pages = 0;
    const searchResults = await this.elasticSearchService.search(
      body,
      lang,
      skip,
      limit,
    );

    if (!searchResults.hits.length) {
      return [];
    }
    const productIds = searchResults.hits.map(
      (hit) => new Types.ObjectId(hit._id),
    );

    const match = {
      isDeleted: false,
      _id: { $in: productIds },
    };
    const pipeline = await buildProductPipeline(
      match,
      sort,
      lang,
      limit,
      skip,
      search,
      productIds,
    );
    const [data, total] = await Promise.all([
      this.productModel.aggregate(pipeline).exec(),
      this.productModel.countDocuments(match),
    ]);

    pages = Math.ceil(total / limit);
    return {
      data: data,
      pages,
      total,
    };
  }

  async searchProductsWithMongoDB(body: SearchProductsDto, lang: string) {
    const regex = new RegExp(body.search, 'i');
    let sort: Record<string, 1 | -1> = { createdAt: -1, views: -1 };
    const limit = body.limit ? body.limit : 12;
    const skip = body.page ? (body.page - 1) * limit : 0;

    const searchProduct = this.productModel
      .aggregate([
        {
          $match: {
            isDeleted: false,
            $or: [
              { [`nameUz`]: regex },
              { [`nameRu`]: regex },
              { [`nameEn`]: regex },
              { [`descriptionUz`]: regex },
              { [`descriptionRu`]: regex },
              { [`descriptionEn`]: regex },
              { [`slugUz`]: regex },
              { [`slugRu`]: regex },
              { [`slugEn`]: regex },
              { ['attributes.valueUz']: regex },
              { ['attributes.valueRu']: regex },
              { ['attributes.valueEn']: regex },
              { [`attributes.nameUz`]: regex },
              { [`attributes.nameRu`]: regex },
              { [`attributes.nameEn`]: regex },
              { [`keywords`]: regex },
              { [`hierarchy.categoryNameUz`]: regex },
              { [`hierarchy.categoryNameRu`]: regex },
              { [`hierarchy.categoryNameEn`]: regex },
              { [`hierarchy.categorySlugUz`]: regex },
              { [`hierarchy.categorySlugRu`]: regex },
              { [`hierarchy.categorySlugEn`]: regex },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: { $ifNull: [`$name${lang}`, null] },
            description: { $ifNull: [`$description${lang}`, null] },
            slug: { $ifNull: [`$slug${lang}`, null] },
            sku: 1,
            currentPrice: 1,
            oldPrice: 1,
            availability: 1,
            images: 1,
            thumbs: 1,
            views: 1,
            categoryId: 1,
            brandId: 1,
            attributes: {
              $map: {
                input: { $ifNull: ['$attributes', []] },
                as: 'attribute',
                in: {
                  name: {
                    $ifNull: [`$$attribute.name${lang}`, `$$attribute.nameUz`],
                  },

                  value: {
                    $ifNull: [
                      `$$attribute.value${lang}`,
                      `$$attribute.valueUz`,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        { $limit: limit },
      ])
      .exec();

    return searchProduct;
  }

  async getProduct(body: GetProductDto) {
    if (!body.slug && !body._id) {
      return {};
    }
    if (body.slug) {
      const searchableFields = ['slugUz', 'slugRu', 'slugEn'];
      const filter = await universalSearchQuery(body.slug, searchableFields);
      const findProduct = await this.productModel.findOne(filter);
      if (!findProduct) {
        return {};
      }
      return findProduct;
    }

    if (body._id) {
      const findProduct = await this.productModel.findById(body._id).lean();
      if (!findProduct) {
        return {};
      }
      return findProduct;
    }
  }

  async getProductForFront(body: GetProductDto, req: Request, lang: string) {
    if (!body.slug) {
      return {};
    }
    const ip = req.ip;
    const searchableFields = ['slugUz', 'slugRu', 'slugEn'];
    const filter = await universalSearchQuery(body.slug, searchableFields);
    const findProduct = await this.productModel.findOne(filter).lean();

    if (!findProduct) {
      return {};
    }
    const pipeline = await buildOneProductPipeline(filter, lang);
    const data = await this.productModel.aggregate(pipeline).exec();
    this.updateProductViewsInBackground(findProduct._id.toString(), ip);
    return data.length ? data[0] : null;
  }

  async getProductsListForFront(
    body: GetProductsListForFrontDto,
    lang: string,
  ) {
    const { category, brands } = body;
    let sort: Record<string, 1 | -1> = { createdAt: -1, views: -1 };
    const limit = body.limit ? body.limit : 12;
    const skip = body.page ? (body.page - 1) * limit : 0;
    let pages = 0;
    let hierarchy: {
      categoryId: string;
      categorySlug: string;
      categoryName: string;
    }[] = [];

    const match: any = { isDeleted: false, status: 1 };
    if (category) {
      const findCategory = await this.categoryModel
        .findOne({ [`slug${lang}`]: category })
        .lean();

      if (!findCategory) {
        return {
          data: [],
          total: 0,
        };
      }
      hierarchy = findCategory.hierarchy.map((item: IHierarchyPayload) => ({
        categoryId: item.categoryId,
        categorySlug: item[`categorySlug${lang}`] as string,
        categoryName: item[`categoryName${lang}`] as string,
      }));
      match.hierarchyPath = findCategory._id.toString();
    }

    if (brands?.length) {
      const brandIds = await this.brandModel
        .find({
          [`slug`]: { $in: brands },
        })
        .distinct('_id');
      if (!brandIds.length) {
        return {
          data: [],
          total: 0,
        };
      }
      match.brandId = { $in: brandIds };
    }

    const pipeline = await buildProductPipeline(match, sort, lang, limit, skip);
    const [data, total] = await Promise.all([
      this.productModel.aggregate(pipeline).exec(),
      this.productModel.countDocuments(match),
    ]);

    const start = total === 0 ? 0 : skip + 1;
    const end = Math.min(skip + limit, total);

    pages = Math.ceil(total / limit);
    return {
      data,
      total,
      pages,
      hierarchy,
      start,
      end,
    };
  }

  async getProductList(body: GetProductsListDto) {
    const [data, total] = await getFilteredResultsWithTotal(
      body,
      this.productModel,
      ['nameUz', 'nameRu', 'nameEn', 'sku'],
    );

    return {
      data: data,
      total,
    };
  }

  async addProduct(body: AddProductDto): Promise<void> {
    try {
      const { nameUz, nameRu, nameEn, categoryId, images } = body;
      const findCategory = await this.categoryModel.findById(categoryId).lean();

      if (!findCategory) {
        throw new BadRequestException('Category not found');
      }

      const slugUz = generateUniqueSlugForProduct(nameUz);
      const slugRu = generateUniqueSlugForProduct(nameRu);
      const slugEn = generateUniqueSlugForProduct(nameEn);
      const sku = await generateUniqueSKU(this.productModel);
      let thumbs: FileMetadataDto[] = [];
      if (images && images?.length) {
        thumbs = await generateThumbs(images);
      }
      const { hierarchyPath, hierarchy } =
        await this.buildCategoryHierarchyService.buildCategoryHierarchy(
          categoryId,
        );

      const createBody = {
        ...body,
        thumbs,
        slugUz,
        slugRu,
        slugEn,
        sku,
        hierarchy,
        hierarchyPath,
      };
      const newProduct = await this.productModel.create(createBody);
      await this.elasticSearchService.indexProduct(newProduct);
      await this.elasticSearchService.bulkIndex([newProduct]);
    } catch (err) {
      console.log(`adding product ====>  ${err}`);
      throw new AddingModelException(err.message);
    }
  }

  async updateProduct(
    updateBody: UpdateProductDto & Partial<{ thumbs: FileMetadataDto[] }>,
  ): Promise<FileMetadataDto[]> {
    const findProduct = await this.productModel.findById(updateBody._id);
    if (!findProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }
    const { nameUz, nameRu, nameEn, images } = updateBody;
    const slugUz =
      nameUz && findProduct.nameUz !== nameUz
        ? generateUniqueSlugForProduct(nameUz)
        : null;

    const slugRu =
      nameRu && findProduct.nameRu !== nameRu
        ? generateUniqueSlugForProduct(nameRu)
        : null;

    const slugEn =
      nameEn && findProduct.nameEn !== nameEn
        ? generateUniqueSlugForProduct(nameEn)
        : null;

    if (images && images?.length) {
      updateBody.thumbs = await generateThumbs(updateBody.images);
    }

    const forUpdateBody: Record<string, any> = {
      ...updateBody,
      ...(slugUz && { slugUz }),
      ...(slugRu && { slugRu }),
      ...(slugEn && { slugEn }),
    };

    if (updateBody?.categoryId) {
      const { hierarchyPath, hierarchy } =
        await this.buildCategoryHierarchyService.buildCategoryHierarchy(
          updateBody.categoryId,
        );
      forUpdateBody.hierarchy = hierarchy;
      forUpdateBody.hierarchyPath = hierarchyPath;
    }
    delete forUpdateBody._id;
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      updateBody._id,
      {
        $set: forUpdateBody,
      },
      { new: true },
    );
    await this.elasticSearchService.updateIndexedProduct(updatedProduct);
    await this.elasticSearchService.bulkIndex([updatedProduct]);
    return updatedProduct.thumbs;
  }

  async deleteProduct(body: DeleteProductDto): Promise<void> {
    const checkProduct = await this.productModel.findById(body._id);
    if (!checkProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }
    await this.productModel.updateOne({ _id: body._id }, { isDeleted: true });
    await this.elasticSearchService.deleteIndexedProduct(body._id.toString());
  }

  async updateProductViewsInBackground(productId: string, ip: string) {
    try {
      const [isProductViewed, isIpsExist] = await Promise.all([
        this.productViewModel.findOne({ productId, ips: ip }),
        this.productViewModel.findOne({ productId }),
      ]);

      if (!isIpsExist) {
        await this.productViewModel.create({
          productId,
          ips: [ip],
        });
      }

      if (!isProductViewed) {
        await Promise.all([
          this.productViewModel.updateOne(
            { productId },
            { $addToSet: { ips: ip } },
          ),
          this.productModel.updateOne(
            { _id: productId },
            {
              $inc: { views: 1 },
            },
          ),
        ]);
      }
    } catch (err) {
      console.error('View update error:', err);
    }
  }

  async indexAllProducts() {
    const batchSize = 100;
    let page = 1;
    let hasMoreProducts = true;
    let successCount = 0;

    while (hasMoreProducts) {
      const skip = (page - 1) * batchSize;
      const products = await this.productModel
        .find()
        .skip(skip)
        .limit(batchSize)
        .lean();

      if (products.length === 0) {
        hasMoreProducts = false;
        break;
      }

      const indexed = await this.elasticSearchService.bulkIndex(products);
      if (indexed) {
        successCount += products.length;
      }

      page++;
    }

    return successCount;
  }
}
