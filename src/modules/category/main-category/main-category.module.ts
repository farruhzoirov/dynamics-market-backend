import { Module } from '@nestjs/common';
import { MainCategoryService } from './main-category.service';
import { MainCategoryController } from './main-category.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {MainCategory, MainCategorySchema} from "../schemas/main-category.schema";

@Module({
  imports: [
      MongooseModule.forFeature([{name: MainCategory.name, schema: MainCategorySchema}]),
  ],
  providers: [MainCategoryService],
  controllers: [MainCategoryController]
})

export class MainCategoryModule {}
