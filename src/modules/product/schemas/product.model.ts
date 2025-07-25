import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FileMetadata } from 'src/common/schema/file-meta.schema';
import { InStockStatus } from 'src/shared/enums/stock-status.enum';
import { IHierarchyPayload } from 'src/shared/interfaces/hierarchy-payload';

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

  @Prop({ type: Number, default: null })
  currentPrice: number;

  @Prop({ type: Number, default: 0 })
  quantity: number;

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

  @Prop({ type: [FileMetadata], default: [] })
  thumbs: FileMetadata[];

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
  hierarchy: IHierarchyPayload[];

  @Prop({ type: [String], default: [] })
  hierarchyPath: string[];

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ enum: InStockStatus, default: InStockStatus.IN_STOCK })
  availability: InStockStatus;

  @Prop({ type: String, default: null })
  link: string;

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
ProductSchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brandId',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.set('toObject', { virtuals: true });
ProductSchema.set('toJSON', { virtuals: true });

export const ProductViewSchema = SchemaFactory.createForClass(ProductViews);
ProductViewSchema.index({ productId: 1 });
ProductViewSchema.index({ ip: 1 });
