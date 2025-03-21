import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { Product, ProductSchema } from '../product/schemas/product.model';
import { RedisCategoryRepository } from 'src/repositories/redis/redis-category.repository';
import { RedisService } from '../../shared/services/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [CategoryService, RedisCategoryRepository, RedisService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
