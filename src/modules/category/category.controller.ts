import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Roles } from '../../common/decorator/roles.decarator';
import { UserRole } from '../../shared/enums/roles.enum';
import {
  AddCategoryDto,
  DeleteCategoryDto,
  GetCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { ValidateObjectIdPipe } from '../../common/pipes/object-id.pipe';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from '../../shared/success/success-responses';
import { Request, Response } from 'express';
import { AcceptLanguagePipe } from 'src/common/pipes/language.pipe';

@Controller('category')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true }))
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('regenerate-slug')
  async regenerateCategorySlug() {
    const count = await this.categoryService.regenerateCategorySlugs();
    return {
      count,
    };
  }

  @ApiHeader({
    name: 'Accept-Language',
    description: 'Sending language (uz, ru, en)',
    required: true,
    schema: { type: 'string', enum: ['uz', 'ru', 'en'], default: 'uz' },
  })
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getCategoriesForFront(@Req() req: Request, @Res() res: Response) {
    const lang = new AcceptLanguagePipe().transform(
      req.headers['accept-language'],
    );
    const categoryList = await this.categoryService.getCategoriesForFront(
      req.body,
      lang,
    );
    res.status(200).json(categoryList);
  }
  @Post('get-list')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async getCategoriesList(
    @Body() body: GetCategoryDto,
    @Body('parentId', ValidateObjectIdPipe) parentId: string,
  ) {
    return await this.categoryService.getCategoriesList(body);
  }

  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async addCategory(
    @Body() body: AddCategoryDto,
    @Body('parentId', ValidateObjectIdPipe) parentId: string,
  ) {
    await this.categoryService.addCategory(body);
    return new AddedSuccessResponse();
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateCategory(
    @Body() updateBody: UpdateCategoryDto,
    @Body('_id', ValidateObjectIdPipe) _id: string,
    @Body('parentId', ValidateObjectIdPipe) parentId: string,
  ) {
    await this.categoryService.updateCategory(updateBody);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.superAdmin, UserRole.admin)
  async deleteCategory(
    @Body() body: DeleteCategoryDto,
    @Body('_id', ValidateObjectIdPipe) _id: string,
  ) {
    await this.categoryService.deleteCategory(body._id);
    return new DeletedSuccessResponse();
  }
}
