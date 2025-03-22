import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

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

@ApiBearerAuth()
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @HttpCode(HttpStatus.OK)
  @Post('get-list')
  async getBannersList(@Body() body: GetBannersListDto) {
    const bannersList = await this.bannerService.getBannersList(body);
    return bannersList;
  }

  @Post('add')
  async addBanner(@Body() body: AddBannerDto) {
    await this.bannerService.addBanner(body);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateBanner(@Body() body: UpdateBannerDto) {
    await this.bannerService.updateBanner(body);
    return new UpdatedSuccessResponse();
  }

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
