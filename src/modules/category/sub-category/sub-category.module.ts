import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {MidCategory, MidCategorySchema} from "../schemas/mid-category.schema";
import {SubCategory, SubCategorySchema} from "../schemas/sub-category.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{name: SubCategory.name, schema: SubCategorySchema}]),
  ],
  providers: [SubCategoryService],
  controllers: [SubCategoryController]
})
export class SubCategoryModule {}
