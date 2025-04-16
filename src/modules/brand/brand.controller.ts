import {
  Body,
  Controller,
  Post,
  Headers,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
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
import { AcceptAppTypePipe } from 'src/common/pipes/app-type.pipe';
import { AppType } from 'src/shared/enums/app-type.enum';

@ApiBearerAuth()
@Controller('brand')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getBrandsList(@Body() body: GetBrandListsDto, @Req() req: Request) {
    let lang = req.headers['accept-language'] as string;
    let appType = req.headers['app-type'] as string;
    lang = new AcceptLanguagePipe().transform(lang);
    appType = new AcceptAppTypePipe().transform(appType);
    let data;
    if (appType === AppType.ADMIN) {
      data = await this.brandService.getBrandsList(body);
      return data;
    }
    if (appType === AppType.USER) {
      data = await this.brandService.getBrandsListForFront(lang);
      return data;
    }
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
