import { Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './schema/banner.schema';
import { Product, ProductSchema } from '../product/schemas/product.model';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { Brand, BrandSchema } from '../brand/schemas/brand.schema';
import { CategoryService } from '../category/category.service';
import { RedisCategoryRepository } from 'src/repositories/redis-category.repository';
import { RedisService } from 'src/shared/services/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Banner.name,
        schema: BannerSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Brand.name,
        schema: BrandSchema,
      },
    ]),
  ],
  controllers: [BannerController],
  providers: [
    BannerService,
    CategoryService,
    RedisService,
    RedisCategoryRepository,
  ],
})
export class BannerModule {}
