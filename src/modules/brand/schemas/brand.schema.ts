import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
  slugUz: string;

  @Prop()
  slugRu: string;

  @Prop()
  slugEn: string;

  @Prop({ default: null })
  website: string;

  @Prop()
  logo: string;

  @Prop({ default: 1 })
  status: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
BrandSchema.index({ slugUz: 1 });
BrandSchema.index({ slugRu: 1 });
BrandSchema.index({ slugEn: 1 });
BrandSchema.index({ nameUz: 1, nameRu: 1, nameEn: 1 });
