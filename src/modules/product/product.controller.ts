import { Body, Controller, Post } from '@nestjs/common';

@Controller('product')
export class ProductController {
  @Post('get-list')
  async getProductsLIst(@Body() products: any) {}

  @Post('add')
  async addProduct(@Body() body: any) {}
  @Post('update')
  async updateProduct(@Body() updateBody: any) {}

  @Post('delete')
  async deleteProduct(@Body() body: any) {}
}
