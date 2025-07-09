import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders } from '@nestjs/swagger';
import { BannerService } from './banner.service';
import {
  AddBannerDto,
  DeleteBannerDto,
  GetBannersListDto,
  UpdateBannerDto,
} from './dto/banner.dto';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import { ValidateObjectIdPipe } from 'src/common/pipes/object-id.pipe';
import { AcceptLanguagePipe } from 'src/common/pipes/language.pipe';
import { AcceptAppTypePipe } from 'src/common/pipes/app-type.pipe';
import { AppType } from 'src/shared/enums/app-type.enum';
import { Roles } from '../../common/decorators/roles.decarator';
import { UserRole } from '../../shared/enums/roles.enum';
import { BaseController } from '../../common/base/base.controller';
import { Request } from 'express';

@ApiBearerAuth()
@Controller('banner')
export class BannerController extends BaseController {
  constructor(private readonly bannerService: BannerService) {
    super();
  }

  // @ApiHeaders([
  //   {
  //     name: 'Accept-Language',
  //     enum: ['uz', 'ru', 'en'],
  //     description: 'Tilni ko‘rsatish kerak: uz, ru yoki en',
  //     required: false,
  //   },
  //   {
  //     name: 'App-Type',
  //     enum: ['admin', 'user'],
  //     description: 'App Type ko‘rsatish kerak: admin yoki user',
  //     required: false,
  //   },
  // ])
  // @HttpCode(HttpStatus.OK)
  // @Post('list')
  // async getBannersList(@Body() body: GetBannersListDto, @Req() req: Request) {
  //   let lang = req.headers['accept-language'] as string;
  //   let appType = req.headers['app-type'] as string;
  //   lang = new AcceptLanguagePipe().transform(lang);
  //   appType = new AcceptAppTypePipe().transform(appType);
  //   let data;
  //   if (appType === AppType.ADMIN) {
  //     data = await this.bannerService.getBannersList(body);
  //     return data;
  //   }
  //   if (appType === AppType.USER) {
  //     data = await this.bannerService.getBannersListForFront(lang);
  //     return data;
  //   }
  // }

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
  async getBannersList(@Body() body: GetBannersListDto, @Req() req: Request) {
    const { lang, appType } = this.extractHeadersInfo(req);

    return await this.handleListRequest(
      body,
      lang,
      appType,
      (body) => this.bannerService.getBannersList(body),
      (lang) => this.bannerService.getBannersListForFront(lang),
    );
  }

  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('add')
  async addBanner(@Body() body: AddBannerDto) {
    await this.bannerService.addBanner(body);
    return new AddedSuccessResponse();
  }

  @Roles(UserRole.admin, UserRole.superAdmin)
  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateBanner(@Body() body: UpdateBannerDto) {
    await this.bannerService.updateBanner(body);
    return new UpdatedSuccessResponse();
  }

  @Roles(UserRole.admin, UserRole.superAdmin)
  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async deleteBanner(
    @Body() body: DeleteBannerDto,
    @Body('_id', ValidateObjectIdPipe) _id: string,
  ) {
    await this.bannerService.deleteBanner(_id);
    return new DeletedSuccessResponse();
  }
}
