import { Module } from '@nestjs/common';

import {MainCategoryModule} from "./main-category/main-category.module";
import {SubCategoryModule} from "./sub-category/sub-category.module";
import {MidCategoryModule} from "./mid-category/mid-category.module";

@Module({
  imports: [
      MainCategoryModule,
      MidCategoryModule,
      SubCategoryModule
  ]
})
export class CategoryModule {

}

