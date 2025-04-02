import {
  Body,
  Controller,
  Post,
  Headers,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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
import { AcceptLanguagePipe } from '../../common/pipes/language.pipe';

@ApiBearerAuth()
@Controller('brand')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @HttpCode(HttpStatus.OK)
  @Post('get-list')
  async getBrandsList(
    @Body() body: GetBrandListsDto,
    @Headers('accept-language') lang: string,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    return await this.brandService.getBrandsList(body, lang);
  }

  @Post('add')
  async addBrand(@Body() body: AddBrandDto) {
    await this.brandService.addBrand(body);
    return new AddedSuccessResponse();
  }

  @Post('update')
  async updateBrand(@Body() body: UpdateBrandDto) {
    await this.brandService.updateBrand(body);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  async deleteBrand(@Body() body: DeleteBrandDto) {
    await this.brandService.deleteBrand(body._id);
    return new DeletedSuccessResponse();
  }
}
