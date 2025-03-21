import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.model';
import { CategoryService } from '../category/category.service';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { RedisCategoryRepository } from 'src/repositories/redis/redis-category.repository';
import { RedisService } from '../../shared/services/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  providers: [
    ProductService,
    CategoryService,
    RedisCategoryRepository,
    RedisService,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
