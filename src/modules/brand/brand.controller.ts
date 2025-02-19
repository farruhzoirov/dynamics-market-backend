import {Body, Controller, Post} from '@nestjs/common';
import {BrandService} from "./brand.service";
import {AddBrandDto, DeleteBrandDto, GetBrandListsDto, UpdateBrandDto} from "./dto/brand.dto";
import {ValidateObjectIdPipe} from "../../common/pipes/object-id.pipe";
import {ApiBearerAuth} from "@nestjs/swagger";


@ApiBearerAuth()
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {
  }

  @Post('get-list')
  async getBrandsList(@Body() body: GetBrandListsDto) {
    return await this.brandService.getBrandsList(body);
  }

  @Post('add')
  async addBrand(@Body() body: AddBrandDto) {

  }

  @Post('update')
  async updateBrand(@Body() body: UpdateBrandDto) {

  }

  @Post('delete')
  async deleteBrand(
      @Body() body: DeleteBrandDto,
      @Body("_id", ValidateObjectIdPipe) _id: string,
  ) {

  }
}
