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
  GetFaqDto,
  GetFaqListDto,
  UpdateFaqDto,
  UpdateFaqsOrderDto,
} from './dto/faq.dto';
import { AcceptAppTypePipe } from 'src/common/pipes/app-type.pipe';
import { Roles } from '../../common/decorators/roles.decarator';
import { UserRole } from '../../shared/enums/roles.enum';

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
    if (lang) {
      lang = new AcceptLanguagePipe().transform(lang);
    }
    appType = new AcceptAppTypePipe().transform(appType);
    const faqList = await this.faqService.getFaqList(appType, lang);
    return faqList;
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-faq')
  async getFaqById(
    @Body() body: GetFaqDto,
    @Headers('Accept-Language') lang: string,
    @Headers('App-Type') appType: string,
  ) {
    if (lang) {
      lang = new AcceptLanguagePipe().transform(lang);
    }
    appType = new AcceptAppTypePipe().transform(appType);
    const getFaqById = await this.faqService.getFaqById(body, appType, lang);
    return getFaqById;
  }

  @Post('add')
  @Roles(UserRole.admin, UserRole.superAdmin)
  async addToFaq(@Body() body: AddFaqDto) {
    await this.faqService.create(body);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('update')
  async updateFaq(@Body() body: UpdateFaqDto) {
    await this.faqService.update(body);
    return new UpdatedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('update-order')
  async updateFaqsOrder(@Body() body: UpdateFaqsOrderDto) {
    await this.faqService.updateFaqsOrder(body);
    return new UpdatedSuccessResponse('FaqsOrder updated');
  }

  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin, UserRole.superAdmin)
  @Post('delete')
  async deleteFaq(@Body() body: DeleteFaqDto) {
    await this.faqService.delete(body);
    return new DeletedSuccessResponse();
  }
}
