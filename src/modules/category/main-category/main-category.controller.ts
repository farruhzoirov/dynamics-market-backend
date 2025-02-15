import {Body, Controller, Get, Post, Query, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery} from "@nestjs/swagger";
import {
  CreateMainCategoryDto,
  DeleteMainCategoryDto,
  GetMainCategoryDto,
  UpdateMainCategoryDto
} from "../dto/main-category.dto";

import {MainCategoryService} from "./main-category.service";
import {Roles} from "../../../shared/decorator/roles.decarator";
import {UserRole} from "../../user/enums/roles.enum";
import {
  CreatedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse
} from "../../../shared/success/success-responses";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('main-category')
@ApiBearerAuth()
export class MainCategoryController {
  constructor(private readonly mainCategoryService: MainCategoryService) {
  }

  @ApiOperation({summary: "Get all main categories with search and pagination"})
  @ApiOkResponse({description: "Returns a list of main categories"})
  @ApiQuery({name: "page", required: false, type: Number, example: 1, description: "Page number for pagination"})
  @ApiQuery({name: "limit", required: false, type: Number, example: 20, description: "Number of items per page"})
  @ApiQuery({
    name: "select",
    required: false,
    type: String,
    example: "nameUz,nameRu",
    description: "Fields to select (comma-separated)"
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    example: "nodejs",
    description: "Search term (searches in all language fields)"
  })

  @Get('all')
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.user)
  async getAllMainCategory(@Query() query: GetMainCategoryDto) {
    return await this.mainCategoryService.getAllMainCategory(query);
  }


  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.user)
  async addMainCategory(@Body() body: CreateMainCategoryDto) {
    await this.mainCategoryService.addMainCategory(body);
    return new CreatedSuccessResponse();
  }

  @Post('update')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateMainCategory(@Body() updateBody: UpdateMainCategoryDto) {
    await this.mainCategoryService.updateMainCategory(updateBody);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async deleteMainCategory(body: DeleteMainCategoryDto) {
    await this.mainCategoryService.deleteMainCategory(body.id);
    return new DeletedSuccessResponse();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.user)
  async uploadUserImage(@UploadedFiles() file: Express.Multer.File) {
    console.log(file);
  }
}

