import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  parentId: string;

  @Prop({ default: [] })
  images: string[];

  @Prop({ default: 1 })
  status: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
