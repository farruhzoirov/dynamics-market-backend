import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Headers,
  Body,
} from '@nestjs/common';
import { AcceptAppTypePipe } from 'src/common/pipes/app-type.pipe';
import { AcceptLanguagePipe } from 'src/common/pipes/language.pipe';
import { NewsService } from './news.service';
import {
  AddNewsDto,
  DeleteNewsDto,
  GetNewsListDto,
  GetOneNewsDto,
  UpdateNewsDto,
} from './dto/news.dto';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import { Roles } from '../../common/decorators/roles.decarator';
import { UserRole } from '../../shared/enums/roles.enum';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getNewsList(
    @Body() body: GetNewsListDto,
    @Headers('Accept-Language') lang: string,
    @Headers('App-Type') appType: string,
  ) {
    if (lang) {
      lang = new AcceptLanguagePipe().transform(lang);
    }
    appType = new AcceptAppTypePipe().transform(appType);
    const newsList = await this.newsService.getNewsList(body, appType, lang);
    return newsList;
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-news')
  async getFaqById(
    @Body() body: GetOneNewsDto,
    @Headers('Accept-Language') lang: string,
    @Headers('App-Type') appType: string,
  ) {
    if (lang) {
      lang = new AcceptLanguagePipe().transform(lang);
    }
    appType = new AcceptAppTypePipe().transform(appType);
    const getOneNews = await this.newsService.getOneNews(body, appType, lang);
    return getOneNews;
  }

  @Post('add')
  @Roles(UserRole.admin, UserRole.superAdmin)
  async addToFaq(@Body() body: AddNewsDto) {
    await this.newsService.create(body);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  @Roles(UserRole.admin, UserRole.superAdmin)
  async updateFaq(@Body() body: UpdateNewsDto) {
    await this.newsService.update(body);
    return new UpdatedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  @Roles(UserRole.admin, UserRole.superAdmin)
  async deleteFaq(@Body() body: DeleteNewsDto) {
    await this.newsService.delete(body);
    return new DeletedSuccessResponse();
  }
}
