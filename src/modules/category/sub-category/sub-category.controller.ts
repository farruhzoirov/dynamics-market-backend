import {Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe} from '@nestjs/common';
import {Roles} from "../../../common/decorator/roles.decarator";
import {UserRole} from "../../../shared/enums/roles.enum";
import {ValidateObjectIdPipe} from "../../../common/pipes/object-id.pipe";
import {
  CreatedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse
} from "../../../shared/success/success-responses";
import {ApiBearerAuth, ApiProperty} from "@nestjs/swagger";
import {SubCategoryService} from "./sub-category.service";

import {
  CreateSubCategoryDto,
  DeleteSubCategoryDto,
  GetSubCategoryDto,
  UpdateSubCategoryDto
} from "../dto/sub-category.dto";

@ApiBearerAuth()
@Controller('sub-category')
@UsePipes(new ValidationPipe({whitelist: true}))
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {
  }

  @Post('get-list')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async getSubCategoriesList(@Body() body: GetSubCategoryDto) {
    return await this.subCategoryService.getSubCategoriesList(body);
  }


  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async addSubCategory(@Body() body: CreateSubCategoryDto, @Body('parentId', ValidateObjectIdPipe) parentId: string) {
    await this.subCategoryService.addSubCategory(body);
    return new CreatedSuccessResponse();
  }

  @ApiProperty({name: '_id'})
  @Post('update')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateSubCategory(
      @Body() updateBody: UpdateSubCategoryDto,
      @Body('_id', ValidateObjectIdPipe) _id: string,
      @Body('midCategory', ValidateObjectIdPipe) midCategory: string
  ) {
    await this.subCategoryService.updateSubCategory(updateBody);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async deleteSubCategory(
      @Body() body: DeleteSubCategoryDto,
      @Body('_id', ValidateObjectIdPipe) _id: string,
  ) {
    await this.subCategoryService.deleteSubCategory(body._id);
    return new DeletedSuccessResponse();
  }
}
