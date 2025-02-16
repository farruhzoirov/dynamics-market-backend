import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';

import {ApiBearerAuth, ApiProperty} from "@nestjs/swagger";
import {FileInterceptor} from "@nestjs/platform-express";

// Dto
import {
  CreateMainCategoryDto,
  DeleteMainCategoryDto,
  GetMainCategoryDto,
  UpdateMainCategoryDto
} from "../dto/main-category.dto";
// Service
import {MainCategoryService} from "./main-category.service";
// Decorator
import {Roles} from "../../../shared/decorator/roles.decarator";
// Enum
import {UserRole} from "../../user/enums/roles.enum";
// SuccessResponse
import {
  CreatedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse
} from "../../../shared/success/success-responses";
// Pipe
import {ValidateObjectIdPipe} from "../../../shared/pipes/object-id.pipe";


@Controller('main-category')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({whitelist: true}))
export class MainCategoryController {
  constructor(private readonly mainCategoryService: MainCategoryService) {
  }

  @Post('get-list')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async getMainCategoriesList(@Body() body: GetMainCategoryDto) {
    return await this.mainCategoryService.getMainCategoriesList(body);
  }


  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async addMainCategory(@Body() body: CreateMainCategoryDto) {
    await this.mainCategoryService.addMainCategory(body);
    return new CreatedSuccessResponse();
  }

  @ApiProperty({name: '_id'})
  @Post('update')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateMainCategory(@Body() updateBody: UpdateMainCategoryDto, @Body('_id', ValidateObjectIdPipe) _id: string) {
    await this.mainCategoryService.updateMainCategory(updateBody);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async deleteMainCategory( @Body() body: DeleteMainCategoryDto, @Body('_id', ValidateObjectIdPipe) _id: string) {
    await this.mainCategoryService.deleteMainCategory(body._id);
    return new DeletedSuccessResponse();
  }
}
