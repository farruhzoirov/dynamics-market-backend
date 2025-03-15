import { Body, Controller, Post } from '@nestjs/common';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductBySlugDto,
  GetProductsListDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductService } from './product.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';

@Controller('product')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post('get-list')
  async getProductsLIst(@Body() body: GetProductsListDto) {
    const productsList = await this.productService.getProductList(body);
    return productsList;
  }

  @Post('get-product-by-slug')
  async getProductBySlug(@Body() body: GetProductBySlugDto) {
    const product = await this.productService.getProductBySlug(body);
    return product;
  }

  @Post('add')
  async addProduct(@Body() body: AddProductDto) {
    await this.productService.addProduct(body);
    return new AddedSuccessResponse();
  }

  @Post('update')
  async updateProduct(@Body() updateBody: UpdateProductDto) {
    await this.productService.updateProduct(updateBody);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  async deleteProduct(@Body() body: DeleteProductDto) {
    await this.productService.deleteProduct(body);
    return new DeletedSuccessResponse();
  }
}
