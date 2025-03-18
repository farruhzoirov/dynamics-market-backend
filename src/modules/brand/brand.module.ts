import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {BrandController} from './brand.controller';
import {BrandService} from './brand.service';
import {Brand, BrandSchema} from './schemas/brand.schema';
import {Product, ProductSchema} from '../product/schemas/product.model';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Brand.name, schema: BrandSchema}]),
    MongooseModule.forFeature([{name: Product.name, schema: ProductSchema}]),
  ],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {
}
