import {Body, Controller, Headers, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {
  AddProductDto,
  DeleteProductDto,
  GetProductBySlugDto,
  GetProductsListDto,
  UpdateProductDto,
} from './dto/product.dto';
import {ProductService} from './product.service';
import {ApiBearerAuth, ApiHeader} from '@nestjs/swagger';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import {AcceptLanguagePipe} from "../../common/decorator/accept-language.decarator";

@Controller('product')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {
  }

  @ApiHeader({
    name: 'accept-language',
    enum: ['uz', 'ru', 'en'],
    description: 'Tilni ko‘rsatish kerak: uz, ru yoki en',
    required: false
  })
  @HttpCode(HttpStatus.OK)
  @Post('get-list')
  async getProductsList(
      @Headers('accept-language') lang: string,
      @Body() body: GetProductsListDto
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    const productsList = await this.productService.getProductList(body, lang);
    return productsList;
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-product')
  async getProductBySlug(@Body() body: GetProductBySlugDto) {
    const product = await this.productService.getProductBySlug(body);
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
