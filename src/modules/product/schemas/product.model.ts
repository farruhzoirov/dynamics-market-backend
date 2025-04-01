import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FileMetadata } from 'src/common/schema/file-meta.schema';

export type ProductDocument = HydratedDocument<Product>;
export type ProductViewDocument = HydratedDocument<ProductViews>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  nameUz: string;

  @Prop({ type: String, required: true })
  nameRu: string;

  @Prop({ type: String, required: true })
  nameEn: string;

  @Prop({ type: String, default: '' })
  descriptionUz: string;

  @Prop({ type: String, default: '' })
  descriptionRu: string;

  @Prop({ type: String, default: '' })
  descriptionEn: string;

  @Prop({ type: String, required: true })
  slugUz: string;

  @Prop({ type: String, required: true })
  slugRu: string;

  @Prop({ type: String, required: true })
  slugEn: string;

  @Prop({
    type: [
      {
        nameUz: String,
        nameRu: String,
        nameEn: String,
        valueUz: String,
        valueRu: String,
        valueEn: String,
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

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: Number, default: null })
  oldPrice: number;

  @Prop({ type: Number, default: 0, required: true })
  currentPrice: number;

  @Prop({ type: Number, default: 0 })
  quantity: number;

  @Prop({ type: Number, default: 0 })
  rate: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    required: true,
  })
  categoryId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
    required: true,
  })
  brandId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [FileMetadata], default: [] })
  images: FileMetadata[];

  @Prop({ type: Number, default: 1 })
  status: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: String, default: null })
  keywords: string;

  @Prop({
    type: [
      {
        categoryId: String,
        categorySlugUz: String,
        categorySlugRu: String,
        categorySlugEn: String,
        categoryNameUz: String,
        categoryNameRu: String,
        categoryNameEn: String,
      },
    ],
    default: [],
  })
  hierarchy: [
    {
      categoryId: string;
      categorySlugUz: string;
      categorySlugRu: string;
      categorySlugEn: string;
      categoryNameUz: string;
      categoryNameRu: string;
      categoryNameEn: string;
    },
  ];

  @Prop({ type: [String], default: [], index: true })
  hierarchyPath: string[];

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Date, default: null })
  viewedAt: Date;

  @Prop({ type: Boolean, default: true })
  inStock: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  details: any;
}

@Schema({ timestamps: true })
export class ProductViews {
  @Prop({ type: mongoose.Types.ObjectId, required: true })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: [String], required: true })
  ips: [string];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ slugUz: 1 });
ProductSchema.index({ slugRu: 1 });
ProductSchema.index({ slugEn: 1 });
ProductSchema.index({ nameUz: 1, nameRu: 1, nameEn: 1 });
ProductSchema.index({ hierarchyPath: 1 });

export const ProductViewSchema = SchemaFactory.createForClass(ProductViews);
ProductViewSchema.index({ productId: 1 });
ProductViewSchema.index({ ip: 1 });
