import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
  UpdateProductDto,
} from './dto/product.dto';
import {
  AddingModelException,
  ModelDataNotFoundByIdException,
} from 'src/common/errors/model/model-based.exceptions';
import { IHierarchyPayload } from 'src/shared/interfaces/hierarchy-payload';
import { FileMetadataDto } from '../../shared/dto/file-meta.dto';
import { generateThumbs } from 'src/common/helpers/generate-thumbs';
import { deleteFiles } from 'src/common/helpers/delete-files';

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
  ) {}

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
    const findProduct = await this.productModel
      .findOne({ [`slug${lang}`]: body.slug })
      .lean();

    if (!findProduct) {
      return {};
    }

    const pipeline = await buildOneProductPipeline(body.slug, lang);
    const data = await this.productModel.aggregate(pipeline).exec();
    this.updateProductViewsInBackground(findProduct._id.toString(), ip);
    return {
      data,
    };
  }

  async getProductsListForFront(
    body: GetProductsListForFrontDto,
    lang: string,
  ) {
    const { category, brands, price } = body;
    let sort: Record<string, 1 | -1> = { createdAt: -1, views: -1 };
    const limit = body.limit ? body.limit : 12;
    const skip = body.page ? (body.page - 1) * limit : 0;
    let pages = 0;
    let hierarchy: {
      categoryId: string;
      categorySlug: string;
      categoryName: string;
    }[] = [];

    const match: any = { isDeleted: false, status: 0 };

    if (body.sort === 'more-expensive') {
      sort = { currentPrice: -1 };
    }

    if (body.sort === 'cheaper') {
      sort = { currentPrice: 1 };
    }

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
          [`slug${lang}`]: { $in: brands },
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

    if (price && price.split('').includes('-')) {
      const [minPrice, maxPrice] = price.split('-');
      match.currentPrice = { $gte: +minPrice, $lte: +maxPrice };
    }

    const pipeline = await buildProductPipeline(match, sort, lang, limit, skip);
    const [data, total] = await Promise.all([
      this.productModel.aggregate(pipeline).exec(),
      this.productModel.countDocuments(match),
    ]);

    pages = Math.ceil(total / limit);
    return {
      data,
      total,
      pages,
      hierarchy,
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
      const { hierarchyPath, hierarchy } =
        await this.buildCategoryHierarchyService.buildCategoryHierarchy(
          categoryId,
        );
      const thumbs: FileMetadataDto[] = await generateThumbs(images);

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
      await this.productModel.create(createBody);
    } catch (err) {
      console.log(`adding product ====>  ${err}`);
      throw new AddingModelException(err.message);
    }
  }

  async updateProduct(
    updateBody: UpdateProductDto & Partial<{ thumbs: FileMetadataDto[] }>,
  ): Promise<void> {
    const findProduct = await this.productModel.findById(updateBody._id);
    if (!findProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }
    const { nameUz, nameRu, nameEn, images } = updateBody;
    const slugUz = nameUz ? generateUniqueSlugForProduct(nameUz) : null;
    const slugRu = nameRu ? generateUniqueSlugForProduct(nameRu) : null;
    const slugEn = nameEn ? generateUniqueSlugForProduct(nameEn) : null;
    const { hierarchyPath, hierarchy } =
      await this.buildCategoryHierarchyService.buildCategoryHierarchy(
        updateBody.categoryId,
      );

    // if (images.length) {
    //   await deleteFiles(findProduct.images);
    //   updateBody.thumbs = await generateThumbs(updateBody.images);
    // }

    const forUpdateBody = {
      ...updateBody,
      ...(slugUz && { slugUz }),
      ...(slugRu && { slugRu }),
      ...(slugEn && { slugEn }),
      hierarchy,
      hierarchyPath,
    };
    await this.productModel.findByIdAndUpdate(updateBody._id, {
      $set: forUpdateBody,
    });
  }

  async deleteProduct(body: DeleteProductDto): Promise<void> {
    const checkProduct = await this.productModel.findById(body._id);
    if (!checkProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }
    await this.productModel.updateOne({ _id: body._id }, { isDeleted: true });
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
              $set: { viewedAt: new Date() },
            },
          ),
        ]);
      } else {
        await this.productModel.updateOne(
          { _id: productId },
          { $set: { viewedAt: new Date() } },
        );
      }
    } catch (err) {
      console.error('View update error:', err);
    }
  }
}
