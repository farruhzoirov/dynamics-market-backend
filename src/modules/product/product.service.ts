import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.model';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';
import { generateUniqueSlugForProduct } from 'src/common/helpers/generate-slug';
import { Brand, BrandDocument } from '../brand/schemas/brand.schema';
import { buildProductPipeline } from 'src/common/helpers/pipelines/product-pipeline';
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
  GetProductBySlugDto,
  GetProductsListDto,
  GetProductsListForFrontDto,
  UpdateProductDto,
} from './dto/product.dto';
import {
  AddingModelException,
  ModelDataNotFoundByIdException,
} from 'src/common/errors/model/model-based.exceptions';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    private readonly buildCategoryHierarchyService: BuildCategoryHierarchyService,
  ) {}

  async getProductsListForFront(
    body: GetProductsListForFrontDto,
    lang: string,
  ) {
    const { categorySlug, brandsSlug, priceRange } = body;
    const sort: Record<string, 1 | -1> = { currentPrice: 1 };
    const limit = body.limit ? body.limit : 0;
    const skip = body.page ? (body.page - 1) * limit : 0;
    const match: any = { isDeleted: false };

    if (categorySlug) {
      const searchableFields = [`slug${lang}`];
      const filter = await universalSearchQuery(categorySlug, searchableFields);
      console.log(filter);
      const findCategory = await this.categoryModel.findOne(filter).lean();
      console.log('findCategory', findCategory);
      if (!findCategory) {
        return {
          data: [],
          total: 0,
        };
      }
      match.categoryId = findCategory._id;
    }

    if (brandsSlug?.length) {
      const brandIds = await this.brandModel
        .find({ [`slug${lang}`]: { $in: brandsSlug } })
        .distinct('_id');
      if (!brandIds.length) {
        return {
          data: [],
          total: 0,
        };
      }
      match.brandId = { $in: brandIds };
    }

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-');
      match.currentPrice = { $gte: +minPrice, $lte: +maxPrice };
    }

    const pipeline = await buildProductPipeline(match, sort, lang, limit, skip);
    const [data, total] = await Promise.all([
      this.productModel.aggregate(pipeline).exec(),
      this.productModel.countDocuments(match),
    ]);

    return {
      data,
      total,
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

  async getProduct(body: GetProductBySlugDto) {
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

  async addProduct(body: AddProductDto): Promise<void> {
    try {
      const { nameUz, nameRu, nameEn, categoryId } = body;
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
      const createBody = {
        ...body,
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

  async updateProduct(updateBody: UpdateProductDto): Promise<void> {
    const findProduct = await this.productModel.findById(updateBody._id);
    if (!findProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }
    const { nameUz, nameRu, nameEn } = updateBody;

    const slugUz = nameUz ? generateUniqueSlugForProduct(nameUz) : null;
    const slugRu = nameRu ? generateUniqueSlugForProduct(nameRu) : null;
    const slugEn = nameEn ? generateUniqueSlugForProduct(nameEn) : null;
    const { hierarchyPath, hierarchy } =
      await this.buildCategoryHierarchyService.buildCategoryHierarchy(
        updateBody.categoryId,
      );

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
}
