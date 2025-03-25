import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FileMetadata } from 'src/common/schema/file-meta.schema';

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
  parentId: mongoose.Schema.Types.ObjectId | null;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [FileMetadata], default: [] })
  images: FileMetadata[];

  @Prop({ type: [String], default: [] })
  hierarchyPath: string[];

  @Prop({ default: 1 })
  status: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ slugUz: 1 });
CategorySchema.index({ slugRu: 1 });
CategorySchema.index({ slugEn: 1 });
CategorySchema.index({ nameUz: 1, nameRu: 1, nameEn: 1 });
CategorySchema.index({ parentId: 1 });
