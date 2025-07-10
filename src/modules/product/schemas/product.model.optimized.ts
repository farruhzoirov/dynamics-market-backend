import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;
export type ProductViewDocument = ProductViews & Document;

@Schema({
  timestamps: true,
  collection: 'products',
  // Optimize document storage
  strict: true,
  versionKey: false,
  // Enable sharding if needed
  shardKey: { _id: 1 },
})
export class Product {
  @Prop({ required: true, index: true })
  nameUz: string;

  @Prop({ required: true, index: true })
  nameRu: string;

  @Prop({ required: true, index: true })
  nameEn: string;

  @Prop({ index: true })
  descriptionUz: string;

  @Prop({ index: true })
  descriptionRu: string;

  @Prop({ index: true })
  descriptionEn: string;

  @Prop({ required: true, unique: true, index: true })
  slugUz: string;

  @Prop({ required: true, unique: true, index: true })
  slugRu: string;

  @Prop({ required: true, unique: true, index: true })
  slugEn: string;

  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @Prop({ required: true, index: true })
  currentPrice: number;

  @Prop({ index: true })
  oldPrice: number;

  @Prop({ required: true, default: 0, index: true })
  quantity: number;

  @Prop({ default: 0 })
  rate: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Category', index: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand', index: true })
  brandId: Types.ObjectId;

  @Prop([String])
  images: string[];

  @Prop({ required: true, default: 1, index: true })
  status: number;

  @Prop({ default: true, index: true })
  inStock: boolean;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: 0, index: true })
  views: number;

  @Prop([String])
  thumbs: string[];

  @Prop([String])
  keywords: string[];

  @Prop({ index: true })
  availability: string;

  @Prop({
    type: [
      {
        nameUz: { type: String, index: true },
        nameRu: { type: String, index: true },
        nameEn: { type: String, index: true },
        valueUz: { type: String, index: true },
        valueRu: { type: String, index: true },
        valueEn: { type: String, index: true },
      },
    ],
  })
  attributes: Array<{
    nameUz: string;
    nameRu: string;
    nameEn: string;
    valueUz: string;
    valueRu: string;
    valueEn: string;
  }>;

  @Prop([String])
  hierarchyPath: string[];

  @Prop({
    type: [
      {
        categoryId: { type: String, index: true },
        categoryNameUz: { type: String, index: true },
        categoryNameRu: { type: String, index: true },
        categoryNameEn: { type: String, index: true },
        categorySlugUz: { type: String, index: true },
        categorySlugRu: { type: String, index: true },
        categorySlugEn: { type: String, index: true },
      },
    ],
  })
  hierarchy: Array<{
    categoryId: string;
    categoryNameUz: string;
    categoryNameRu: string;
    categoryNameEn: string;
    categorySlugUz: string;
    categorySlugRu: string;
    categorySlugEn: string;
  }>;
}

@Schema({
  timestamps: true,
  collection: 'product_views',
  strict: true,
  versionKey: false,
})
export class ProductViews {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Product', index: true })
  productId: Types.ObjectId;

  @Prop([String])
  ips: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export const ProductViewSchema = SchemaFactory.createForClass(ProductViews);

// Create compound indexes for better query performance
ProductSchema.index({ hierarchyPath: 1, status: 1, isDeleted: 1 });
ProductSchema.index({ slugUz: 1, slugRu: 1, slugEn: 1 });
ProductSchema.index({ views: -1, createdAt: -1 });
ProductSchema.index({ categoryId: 1, status: 1, isDeleted: 1 });
ProductSchema.index({ brandId: 1, status: 1, isDeleted: 1 });
ProductSchema.index({ currentPrice: 1, status: 1, isDeleted: 1 });
ProductSchema.index({ inStock: 1, status: 1, isDeleted: 1 });
ProductSchema.index({ createdAt: -1, status: 1, isDeleted: 1 });

// Text index for search functionality
ProductSchema.index({
  nameUz: 'text',
  nameRu: 'text',
  nameEn: 'text',
  descriptionUz: 'text',
  descriptionRu: 'text',
  descriptionEn: 'text',
  keywords: 'text',
  sku: 'text',
});

// Sparse indexes for optional fields
ProductSchema.index({ oldPrice: 1 }, { sparse: true });
ProductSchema.index({ rate: 1 }, { sparse: true });

// TTL index for soft-deleted products (optional cleanup after 30 days)
ProductSchema.index(
  { updatedAt: 1 },
  { 
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { isDeleted: true }
  }
);

// ProductViews indexes
ProductViewSchema.index({ productId: 1 }, { unique: true });
ProductViewSchema.index({ 'ips': 1 });

// Add middleware for automatic cache invalidation
ProductSchema.post('save', function() {
  // Emit event for cache invalidation
  process.emit('product-cache-invalidate', this._id);
});

ProductSchema.post('findOneAndUpdate', function() {
  // Emit event for cache invalidation
  if (this.getQuery()._id) {
    process.emit('product-cache-invalidate', this.getQuery()._id);
  }
});

ProductSchema.post('updateOne', function() {
  // Emit event for cache invalidation
  if (this.getQuery()._id) {
    process.emit('product-cache-invalidate', this.getQuery()._id);
  }
});