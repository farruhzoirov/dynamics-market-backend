import {Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiProperty} from "@nestjs/swagger";

import {Roles} from "../../../common/decorator/roles.decarator";
import {UserRole} from "../../../shared/enums/roles.enum";

import {
  CreatedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse
} from "../../../shared/success/success-responses";

import {ValidateObjectIdPipe} from "../../../common/pipes/object-id.pipe";
import {MidCategoryService} from "./mid-category.service";
import {
  CreateMidCategoryDto,
  DeleteMidCategoryDto,
  GetMidCategoryDto,
  UpdateMidCategoryDto
} from "../dto/min-category.dto";

@ApiBearerAuth()
@Controller('mid-category')
export class MidCategoryController {
  constructor(private readonly midCategoryService: MidCategoryService) {
  }

  @Post('get-list')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async getMidCategoriesList(@Body() body: GetMidCategoryDto) {
    return await this.midCategoryService.getMinCategoriesList(body);
  }


  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async addMidCategory(@Body() body: CreateMidCategoryDto, @Body('parentId', ValidateObjectIdPipe) parentId: string) {
    await this.midCategoryService.addMinCategory(body);
    return new CreatedSuccessResponse();
  }

  @ApiProperty({name: '_id'})
  @Post('update')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateMidCategory(
      @Body() updateBody: UpdateMidCategoryDto,
      @Body('_id', ValidateObjectIdPipe) _id: string,
      @Body('parentId', ValidateObjectIdPipe) parentId: string
  ) {
    await this.midCategoryService.updateMidCategory(updateBody);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async deleteMidCategory(
      @Body() body: DeleteMidCategoryDto,
      @Body('_id', ValidateObjectIdPipe) _id: string,
  ) {
    await this.midCategoryService.deleteMidCategory(body._id);
    return new DeletedSuccessResponse();
  }
}
