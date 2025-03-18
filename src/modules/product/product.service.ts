import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Product, ProductDocument} from './schemas/product.model';
import {getFilteredResultsWithTotal} from 'src/common/helpers/universal-query-builder';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductBySlugDto,
  GetProductsListDto,
  UpdateProductDto,
} from './dto/product.dto';
import {generateUniqueSlug} from 'src/common/helpers/generate-slug';
import {AddingModelException, ModelDataNotFoundByIdException,} from 'src/common/errors/model/model-based.exceptions';
import {generateUniqueSKU} from 'src/common/helpers/generate-sku';
import {universalSearchQuery} from 'src/common/helpers/universal-search-query';
import {CategoryService} from '../category/category.service';
import {Category, CategoryDocument,} from '../category/schemas/category.schema';

@Injectable()
export class ProductService {
  constructor(
      @InjectModel(Product.name)
      private readonly productModel: Model<ProductDocument>,
      @InjectModel(Category.name)
      private readonly categoryModel: Model<CategoryDocument>,
      private readonly categoryService: CategoryService,
  ) {
  }

  async getProductList(body: GetProductsListDto, lang: string) {
    const [data, total] = await getFilteredResultsWithTotal(
        body,
        this.productModel,
        ['nameUz', 'nameRu', 'nameEn'],
    );

    const formattedData = Array.isArray(data)
        ? data.map((product) => ({
          ...product,
          hierarchy: product.hierarchy.map((category) => ({
            categoryId: category.categoryId,
            categorySlug: category[`categorySlug${lang}`],
            categoryName: category[`categoryName${lang}`],
          })),
        }))
        : [];

    return {
      data: formattedData,
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
      const {nameUz, nameRu, nameEn, categoryId} = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
      const sku = await generateUniqueSKU(this.productModel);

      const findCategory = await this.categoryModel.findById(categoryId).lean();

      if (!findCategory) {
        throw new BadRequestException('Category not found');
      }

      const {hierarchyPath, hierarchy} = await this.categoryService.buildCategoryHierarchy(categoryId);
      await this.productModel.create({
        ...body,
        hierarchyPath,
        hierarchy,
        sku
      });
    } catch (err) {
      console.log(`adding product ====>  ${err}`);
      throw new AddingModelException(err.message);
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
    const {hierarchyPath, hierarchy} =
        await this.categoryService.buildCategoryHierarchy(updateBody._id);

    await this.productModel.findByIdAndUpdate(updateBody._id, {
      $set: {
        ...updateBody,
        hierarchy,
        hierarchyPath,
      },
    });
  }

  async deleteProduct(body: DeleteProductDto) {
    const checkProduct = await this.productModel.findById(body._id);
    if (!checkProduct) {
      throw new ModelDataNotFoundByIdException('Product not found');
    }
    await this.productModel.updateOne({_id: body._id}, {isDeleted: true});
  }
}
