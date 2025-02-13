import {Body, Controller, Get, Post, Query, UseInterceptors} from '@nestjs/common';
import {ApiBearerAuth} from "@nestjs/swagger";
import {
  CreateMainCategoryDto,
  DeleteMainCategoryDto,
  GetMainCategoryDto,
  UpdateMainCategoryDto
} from "../dto/main-category.dto";
import {MainCategoryService} from "./main-category.service";
import {Roles} from "../../../shared/decorator/roles.decarator";
import {UserRole} from "../../user/enums/roles.enum";
import {CleanResponseInterceptor} from "../../../shared/interceptors/clean-response";

@Controller('main-category')
@ApiBearerAuth()
@UseInterceptors(CleanResponseInterceptor)
export class MainCategoryController {
  constructor(private readonly mainCategoryService: MainCategoryService) {
  }

  @Get('all')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async getAllMainCategory(@Query() query: GetMainCategoryDto) {
     return await this.mainCategoryService.getAllMainCategory(query);
  }

  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin, UserRole.user)
  async addMainCategory(@Body() body: CreateMainCategoryDto) {
    await this.mainCategoryService.addMainCategory(body);
  }

  @Post('update')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateMainCategory(@Body() updateBody: UpdateMainCategoryDto) {

  }

  @Post('delete')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async deleteMainCategory(body: DeleteMainCategoryDto) {
    await this.mainCategoryService.deleteMainCategory(body.id)
  }
}
