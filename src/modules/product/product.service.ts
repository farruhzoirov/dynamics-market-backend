import { Injectable } from '@nestjs/common';
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
  ) {}

  async getProductList(body: GetProductsListDto) {
    const [data, total] = await getFilteredResultsWithTotal(
      body,
      this.productModel,
      ['nameUz', 'nameRu', 'nameEn'],
    );
    return {
      data,
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

  async addProduct(body: AddProductDto) {
    try {
      const { nameUz, nameRu, nameEn, categoryId } = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
      body.sku = await generateUniqueSKU(this.productModel);
      const categoryHierarchy = await this.categoryModel.aggregate([
        {
          $match: { _id: categoryId },
        },
        {
          $graphLookup: {
            from: 'categories',
            startWith: '$parentId',
            connectFromField: 'parentId',
            connectToField: '_id',
            as: 'hierarchy',
            depthField: 'level',
          },
        },
        { $unwind: '$hierarchy' },
        { $sort: { 'hierarchy.level': 1 } },
        {
          $group: {
            _id: '$_id',
            hierarchy: {
              $push: {
                categoryId: '$hierarchy._id',
                categorySlugUz: '$hierarchy.slugUz',
                categorySlugRu: '$hierarchy.slugRu',
                categorySlugEn: '$hierarchy.slugEn',
                categoryNameUz: '$hierarchy.nameUz',
                categoryNameRu: '$hierarchy.nameRu',
                categoryNameEn: '$hierarchy.nameEn',
              },
            },
          },
        },
      ]);

      console.log(categoryHierarchy);

      body.categoryHierarchy = categoryHierarchy;
      await this.productModel.create(body);
    } catch (err) {
      console.log(`adding product ====>  ${err.message}`);
      throw new AddingModelException();
    }
  }

  async updateProduct(updateBody: UpdateProductDto) {
    const languages = ['Uz', 'Ru', 'En'];
    languages.forEach((lang) => {
      const nameKey = `name${lang}`;
      const slugKey = `slug${lang}`;

      if (updateBody[nameKey]) {
        updateBody[slugKey] = generateUniqueSlug(updateBody[nameKey]);
      }
    });

    const findProduct = await this.productModel.findById(updateBody._id);

    if (!findProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }

    await this.productModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        ...updateBody,
      },
    });
  }

  async deleteProduct(body: DeleteProductDto) {
    const checkProduct = await this.productModel.findById(body._id);
    if (!checkProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }
    await this.productModel.updateOne({ _id: body._id }, { isDeleted: true });
  }
}
