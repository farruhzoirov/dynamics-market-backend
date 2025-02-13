import { Module } from '@nestjs/common';
import { MidCategoryService } from './mid-category.service';
import { MidCategoryController } from './mid-category.controller';

@Module({
  providers: [MidCategoryService],
  controllers: [MidCategoryController]
})
export class MidCategoryModule {}
