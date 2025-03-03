import { Body, Controller, Post } from '@nestjs/common';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductService } from './product.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('product')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post('get-list')
  async getProductsLIst(@Body() body: GetProductDto) {
    const productsList = await this.productService.getProductList(body);
    return productsList;
  }

  @Post('add')
  async addProduct(@Body() body: AddProductDto) {
    await this.productService.addProduct(body);
  }

  @Post('update')
  async updateProduct(@Body() updateBody: UpdateProductDto) {
    await this.productService.updateProduct(updateBody);
  }

  @Post('delete')
  async deleteProduct(@Body() body: DeleteProductDto) {
    await this.productService.deleteProduct(body);
  }
}
