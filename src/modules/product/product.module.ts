import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.model';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { BuildCategoryHierarchyService } from 'src/shared/services/build-hierarchy.service';
import { Brand, BrandSchema } from '../brand/schemas/brand.schema';

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
      {
        name: Brand.name,
        schema: BrandSchema,
      },
    ]),
  ],
  providers: [ProductService, BuildCategoryHierarchyService],
  controllers: [ProductController],
})
export class ProductModule {}
