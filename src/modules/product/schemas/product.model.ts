import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FileMetadata } from 'src/common/schema/file-meta.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop()
  nameUz: string;

  @Prop()
  nameRu: string;

  @Prop()
  nameEn: string;

  @Prop()
  slugUz: string;

  @Prop()
  slugRu: string;

  @Prop()
  slugEn: string;

  @Prop({
    type: [
      {
        nameUz: String,
        nameRu: String,
        nameEn: String,
        value: {
          valueUz: String,
          valueRu: String,
          valueEn: String,
        },
      },
    ],
  })
  attributes: {
    nameUz: string;
    nameRu: string;
    nameEn: string;
    value: {
      valueUz: string;
      valueRu: string;
      valueEn: string;
    };
  }[];

  @Prop()
  oldPrice: number;

  @Prop()
  currentPrice: number;

  @Prop()
  quantity: number;

  @Prop()
  rate: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  categoryId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
  })
  brandId: string;

  @Prop({ type: [FileMetadata], default: [] })
  images: FileMetadata[];

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ slugUz: 1 });
ProductSchema.index({ slugRu: 1 });
ProductSchema.index({ slugEn: 1 });
ProductSchema.index({ nameUz: 1, nameRu: 1, nameEn: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ brandId: 1 });
