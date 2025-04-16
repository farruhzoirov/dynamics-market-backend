import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Headers,
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
import { AcceptLanguagePipe } from 'src/common/pipes/language.pipe';

@ApiBearerAuth()
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getBannersList(
    @Body() body: GetBannersListDto,
    @Headers('Accept-Language') lang: string,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    const isLanguageExist = lang ? true : false;
    const bannersList = await this.bannerService.getBannersList(
      body,
      lang,
      isLanguageExist,
    );
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
