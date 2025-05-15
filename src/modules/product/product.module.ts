import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Product,
  ProductSchema,
  ProductViews,
  ProductViewSchema,
} from './schemas/product.model';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { BuildCategoryHierarchyService } from 'src/shared/services/build-hierarchy.service';
import { Brand, BrandSchema } from '../brand/schemas/brand.schema';

import { SearchModule } from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: ProductViews.name,
        schema: ProductViewSchema,
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
    SearchModule,
  ],
  providers: [ProductService, BuildCategoryHierarchyService],
  controllers: [ProductController],
})
export class ProductModule {}
