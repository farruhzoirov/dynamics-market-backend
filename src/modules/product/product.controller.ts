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
import { AcceptAppTypePipe } from 'src/common/pipes/app-type.pipe';
import { AppType } from 'src/shared/enums/app-type.enum';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

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
  async getProductsForFront(@Body() body: any, @Req() req: Request) {
    let lang = req.headers['accept-language'] as string;
    let appType = req.headers['app-type'] as string;
    lang = new AcceptLanguagePipe().transform(lang);
    appType = new AcceptAppTypePipe().transform(appType);
    let data;
    let validatedBody;

    if (appType === AppType.ADMIN) {
      validatedBody = plainToInstance(GetProductsListDto, body);
      await validateOrReject(validatedBody);
      data = await this.productService.getProductList(validatedBody);
      return data;
    }

    if (appType === AppType.USER) {
      validatedBody = plainToInstance(GetProductsListForFrontDto, body);
      await validateOrReject(validatedBody);
      data = await this.productService.getProductsListForFront(
        validatedBody,
        lang,
      );
      return data;
    }
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
