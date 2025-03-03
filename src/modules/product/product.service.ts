import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.model';
import { Model } from 'mongoose';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';
import { AddProductDto, GetProductDto } from './dto/product.dto';

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

  async addProduct(body: AddProductDto) {}

  async updateProduct() {}
}
