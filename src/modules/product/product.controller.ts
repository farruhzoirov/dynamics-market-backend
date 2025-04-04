import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductDto,
  GetProductsListDto,
  GetProductsListForFrontDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import { AcceptLanguagePipe } from '../../common/pipes/language.pipe';
import { Request } from 'express';

@Controller('product')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiHeader({
    name: 'Accept-Language',
    enum: ['uz', 'ru', 'en'],
    description: 'Tilni ko‘rsatish kerak: uz, ru yoki en',
    required: false,
  })
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getProductsForFront(
    @Body() body: GetProductsListForFrontDto,
    @Headers('Accept-Language') lang: string,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    const productList = await this.productService.getProductsListForFront(
      body,
      lang,
    );
    return productList;
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-list')
  async getProductsList(@Body() body: GetProductsListDto) {
    const productsList = await this.productService.getProductList(body);
    return productsList;
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-product')
  async getProduct(
    @Body() body: GetProductDto,
    @Headers('Accept-Language') lang: string | undefined,
    @Req() req: Request,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    const product = await this.productService.getProduct(body, req, lang);
    return product;
  }

  @Post('add')
  async addProduct(@Body() body: AddProductDto) {
    await this.productService.addProduct(body);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateProduct(@Body() updateBody: UpdateProductDto) {
    await this.productService.updateProduct(updateBody);
    return new UpdatedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async deleteProduct(@Body() body: DeleteProductDto) {
    await this.productService.deleteProduct(body);
    return new DeletedSuccessResponse();
  }
}
