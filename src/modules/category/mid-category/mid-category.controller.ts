import {Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe} from '@nestjs/common';
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
@UsePipes(new ValidationPipe({whitelist: true}))
export class MidCategoryController {
  constructor(private readonly midCategoryService: MidCategoryService) {
  }

  @Post('get-list')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async getMidCategoriesList(
      @Body() body: GetMidCategoryDto,
      @Body('parentId', ValidateObjectIdPipe) parentId: string) {
    return await this.midCategoryService.getMidCategoriesList(body);
  }


  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async addMidCategory(@Body() body: CreateMidCategoryDto, @Body('parentId', ValidateObjectIdPipe) parentId: string) {
    await this.midCategoryService.addMidCategory(body);
    return new CreatedSuccessResponse();
  }

  @ApiProperty({name: '_id'})
  @Post('update')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateMidCategory(
      @Body() updateBody: UpdateMidCategoryDto,
      @Body('_id', ValidateObjectIdPipe) _id: string,
      @Body('mainCategory', ValidateObjectIdPipe) mainCategory: string
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
