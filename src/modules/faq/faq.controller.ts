import {
  Body,
  Controller,
  Post,
  Headers,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import { AcceptLanguagePipe } from 'src/common/pipes/language.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import {
  AddFaqDto,
  DeleteFaqDto,
  GetFaqListDto,
  UpdateFaqDto,
} from './dto/faq.dto';
import { AcceptAppTypePipe } from 'src/common/pipes/app-type.pipe';

@ApiBearerAuth()
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getFaqList(
    @Headers('Accept-Language') lang: string,
    @Headers('App-Type') appType: string,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    appType = new AcceptAppTypePipe().transform(appType);
    const faqList = await this.faqService.getFaqList(appType, lang);
    return faqList;
  }

  @Post('add')
  async addToFaq(@Body() body: AddFaqDto) {
    await this.faqService.create(body);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateFaq(@Body() body: UpdateFaqDto) {
    await this.faqService.update(body);
    return new UpdatedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async deleteFaq(@Body() body: DeleteFaqDto) {
    await this.faqService.delete(body);
    return new DeletedSuccessResponse();
  }
}
