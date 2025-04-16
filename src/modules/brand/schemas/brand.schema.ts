import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FileMetadata } from 'src/common/schema/file-meta.schema';

export type BrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true })
export class Brand {
  @Prop()
  nameUz: string;

  @Prop()
  nameRu: string;

  @Prop()
  nameEn: string;

  @Prop()
  slug: string;

  @Prop({ default: null })
  website: string;

  @Prop({ type: FileMetadata, default: null })
  logo: FileMetadata;

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
BrandSchema.index({ slug: 1 });
BrandSchema.index({ nameUz: 1, nameRu: 1, nameEn: 1 });
