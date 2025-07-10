import {
  Body,
  Controller,
  Get,
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
  SearchProductsDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductService } from './product.service';
import { ApiBearerAuth } from '@nestjs/swagger';
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
import { Roles } from '../../common/decorators/roles.decarator';
import { UserRole } from '../../shared/enums/roles.enum';

@Controller('product')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(HttpStatus.OK)
  @Get('index-products')
  async indexProducts() {
    const data = await this.productService.indexAllProducts();
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('search')
  async searchProducts(
    @Body() body: SearchProductsDto,
    @Headers('Accept-Language') lang: string,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    const data = await this.productService.searchProducts(body, lang);
    // const data = await this.productService.searchProductsWithMongoDB(
    //   body,
    //   lang,
    // );
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getProductsForFront(
    @Body() body: any,
    @Headers('Accept-Language') lang: string,
    @Headers('App-Type') appType: string,
    @Req() req: Request,
  ) {
    appType = new AcceptAppTypePipe().transform(appType);
    lang = new AcceptLanguagePipe().transform(lang);
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
    @Headers('Accept-Language') lang: string,
    @Headers('App-Type') appType: string,
    @Req() req: Request,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    appType = new AcceptAppTypePipe().transform(appType);
    let data;
    if (appType === AppType.ADMIN) {
      data = await this.productService.getProduct(body);
      return data;
    }
    if (appType === AppType.USER) {
      data = await this.productService.getProductForFront(body, req, lang);
      return data;
    }
  }

  @ApiBearerAuth()
  @Post('add')
  @Roles(UserRole.admin, UserRole.superAdmin)
  async addProduct(@Body() body: AddProductDto) {
    await this.productService.addProduct(body);
    return new AddedSuccessResponse();
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('update')
  @Roles(UserRole.admin, UserRole.superAdmin)
  async updateProduct(@Body() updateBody: UpdateProductDto) {
    const response = await this.productService.updateProduct(updateBody);
    return new UpdatedSuccessResponse(response);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('delete')
  @Roles(UserRole.admin, UserRole.superAdmin)
  async deleteProduct(@Body() body: DeleteProductDto) {
    await this.productService.deleteProduct(body);
    return new DeletedSuccessResponse();
  }
}
