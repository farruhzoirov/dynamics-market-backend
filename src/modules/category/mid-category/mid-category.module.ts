import { Module } from '@nestjs/common';
import { MidCategoryService } from './mid-category.service';
import { MidCategoryController } from './mid-category.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {MidCategory, MidCategorySchema} from "../schemas/mid-category.schema";
import {SubCategory, SubCategorySchema} from "../schemas/sub-category.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
        {name: MidCategory.name, schema: MidCategorySchema},
        {name: SubCategory.name, schema: SubCategorySchema},
    ]),
  ],
  providers: [MidCategoryService],
  controllers: [MidCategoryController]
})
export class MidCategoryModule {

}
