import { Module } from '@nestjs/common';
import { MidCategoryService } from './mid-category.service';
import { MidCategoryController } from './mid-category.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {MainCategory, MainCategorySchema} from "../schemas/main-category.schema";
import {MidCategory, MidCategorySchema} from "../schemas/mid-category.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{name: MidCategory.name, schema: MidCategorySchema}]),
  ],
  providers: [MidCategoryService],
  controllers: [MidCategoryController]
})
export class MidCategoryModule {

}
