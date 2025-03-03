import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.model';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductDto,
  UpdateProductDto,
} from './dto/product.dto';
import { generateUniqueSlug } from 'src/common/helpers/generate-slugs';
import {
  AddingModelException,
  ModelDataNotFoundByIdException,
} from 'src/common/errors/model/model-based.exceptions';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getProductList(body: GetProductDto) {
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

  async addProduct(body: AddProductDto) {
    try {
      const { nameUz, nameRu, nameEn } = body;
      body.slugUz = generateUniqueSlug(nameUz);
      body.slugRu = generateUniqueSlug(nameRu);
      body.slugEn = generateUniqueSlug(nameEn);
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
    await this.productModel.deleteOne({ _id: body._id });
  }
}
