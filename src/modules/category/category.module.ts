import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { Product, ProductSchema } from '../product/schemas/product.model';
import { RedisService } from '../../shared/module/redis/redis.service';
import { BuildCategoryHierarchyService } from 'src/shared/services/build-hierarchy.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [CategoryService, BuildCategoryHierarchyService, RedisService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
