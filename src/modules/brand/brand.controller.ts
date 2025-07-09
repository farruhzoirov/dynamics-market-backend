import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import {
  AddBrandDto,
  DeleteBrandDto,
  GetBrandListsDto,
  UpdateBrandDto,
} from './dto/brand.dto';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from '../../shared/success/success-responses';
import { Roles } from '../../common/decorators/roles.decarator';
import { UserRole } from '../../shared/enums/roles.enum';
import { BaseController } from '../../common/base/base.controller';
import { Request } from 'express';

@ApiBearerAuth()
@Controller('brand')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class BrandController extends BaseController {
  constructor(private readonly brandService: BrandService) {
    super();
  }

  @ApiHeaders([
    {
      name: 'Accept-Language',
      enum: ['uz', 'ru', 'en'],
      description: 'Tilni ko‘rsatish kerak: uz, ru yoki en',
      required: false,
    },
    {
      name: 'App-Type',
      enum: ['admin', 'user'],
      description: 'App Type ko‘rsatish kerak: admin yoki user',
      required: false,
    },
  ])
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getBrandsList(@Body() body: GetBrandListsDto, @Req() req: Request) {
    const { lang, appType } = this.extractHeadersInfo(req);
    return await this.handleListRequest(
      body,
      lang,
      appType,
      (body) => this.brandService.getBrandsList(body),
      (lang) => this.brandService.getBrandsListForFront(lang),
    );
  }

  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('add')
  async addBrand(@Body() body: AddBrandDto) {
    await this.brandService.addBrand(body);
    return new AddedSuccessResponse();
  }

  @Roles(UserRole.admin, UserRole.superAdmin)
  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateBrand(@Body() body: UpdateBrandDto) {
    await this.brandService.updateBrand(body);
    return new UpdatedSuccessResponse();
  }

  @Roles(UserRole.admin, UserRole.superAdmin)
  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async deleteBrand(@Body() body: DeleteBrandDto) {
    await this.brandService.deleteBrand(body._id);
    return new DeletedSuccessResponse();
  }
}
