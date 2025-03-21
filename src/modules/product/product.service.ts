import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.model';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductBySlugDto,
  GetProductsListDto,
  UpdateProductDto,
} from './dto/product.dto';
import { generateUniqueSlug } from 'src/common/helpers/generate-slug';
import {
  AddingModelException,
  ModelDataNotFoundByIdException,
} from 'src/common/errors/model/model-based.exceptions';
import { generateUniqueSKU } from 'src/common/helpers/generate-sku';
import { universalSearchQuery } from 'src/common/helpers/universal-search-query';
import { CategoryService } from '../category/category.service';
import {
  Category,
  CategoryDocument,
} from '../category/schemas/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly categoryService: CategoryService,
  ) {}

  async getProductsListForFront(body: GetProductsListDto, lang: string) {}

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

  async getProductBySlug(body: GetProductBySlugDto) {
    if (!body.slug) {
      return {};
    }
    const searchableFields = ['slugUz', 'slugRu', 'slugEn'];
    const filter = await universalSearchQuery(body.slug, searchableFields);
    const findProduct = await this.productModel.findOne(filter);

    if (!findProduct) {
      return {};
    }

    return findProduct;
  }

  async addProduct(body: AddProductDto): Promise<void> {
    try {
      const { nameUz, nameRu, nameEn, categoryId } = body;
      const findCategory = await this.categoryModel.findById(categoryId).lean();

      if (!findCategory) {
        throw new BadRequestException('Category not found');
      }

      const slugUz = generateUniqueSlug(nameUz);
      const slugRu = generateUniqueSlug(nameRu);
      const slugEn = generateUniqueSlug(nameEn);
      const sku = await generateUniqueSKU(this.productModel);

      const { hierarchyPath, hierarchy } =
        await this.categoryService.buildCategoryHierarchy(categoryId);
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

    const slugUz = generateUniqueSlug(nameUz);
    const slugRu = generateUniqueSlug(nameRu);
    const slugEn = generateUniqueSlug(nameEn);

    const { hierarchyPath, hierarchy } =
      await this.categoryService.buildCategoryHierarchy(updateBody._id);

    const updatingBody = {
      ...updateBody,
      slugUz,
      slugRu,
      slugEn,
      hierarchy,
      hierarchyPath,
    };
    await this.productModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        updatingBody,
      },
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
