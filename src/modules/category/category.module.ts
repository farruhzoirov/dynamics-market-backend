import { Module } from '@nestjs/common';
import {MainCategoryModule} from "./main-category/main-category.module";
import {SubCategoryModule} from "./sub-category/sub-category.module";
import {MidCategoryModule} from "./mid-category/mid-category.module";
import {MainCategoryService} from "./main-category/main-category.service";

@Module({
  imports: [
      MainCategoryModule,
      MidCategoryModule,
      SubCategoryModule
  ]
})
export class CategoryModule {

}

