import {Body, Controller, Post} from '@nestjs/common';
import {BrandService} from "./brand.service";
import {AddBrandDto, DeleteBrandDto, GetBrandListsDto, UpdateBrandDto} from "./dto/brand.dto";
import {ValidateObjectIdPipe} from "../../common/pipes/object-id.pipe";
import {ApiBearerAuth} from "@nestjs/swagger";
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse
} from "../../shared/success/success-responses";


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
    await this.brandService.addBrand(body);
    return new AddedSuccessResponse();
  }

  @Post('update')
  async updateBrand(@Body() body: UpdateBrandDto) {
    await this.brandService.updateBrand(body);
    return new UpdatedSuccessResponse()
  }

  @Post('delete')
  async deleteBrand(
      @Body() body: DeleteBrandDto,
      @Body("_id", ValidateObjectIdPipe) _id: string,
  ) {
      await this.brandService.deleteBrand(body._id);
      return new DeletedSuccessResponse();
  }
}
