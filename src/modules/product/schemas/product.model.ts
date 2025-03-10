import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FileMetadata } from 'src/common/schema/file-meta.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  nameUz: string;

  @Prop({ required: true })
  nameRu: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop({ default: '' })
  descriptionUz: string;

  @Prop({ default: '' })
  descriptionRu: string;

  @Prop({ default: '' })
  descriptionEn: string;

  @Prop({ required: true })
  slugUz: string;

  @Prop({ required: true })
  slugRu: string;

  @Prop({ required: true })
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
    required: true,
  })
  attributes: {
    nameUz: string;
    nameRu: string;
    nameEn: string;
    valueUz: string;
    valueRu: string;
    valueEn: string;
  }[];

  @Prop({ required: true })
  sku: string;

  @Prop({ default: 0 })
  oldPrice: number;

  @Prop({ default: 0, required: true })
  currentPrice: number;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  rate: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    required: true,
  })
  categoryId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
    required: true,
  })
  brandId: string;

  @Prop({ type: [FileMetadata], default: [] })
  images: FileMetadata[];

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  details: any;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ slugUz: 1 });
ProductSchema.index({ slugRu: 1 });
ProductSchema.index({ slugEn: 1 });
ProductSchema.index({ nameUz: 1, nameRu: 1, nameEn: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ brandId: 1 });
