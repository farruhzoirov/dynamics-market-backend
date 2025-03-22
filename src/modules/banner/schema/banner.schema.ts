import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FileMetadata } from 'src/common/schema/file-meta.schema';

export type BannerDocument = HydratedDocument<Banner>;

export enum BannerTypes {
  PRODUCT = 'product',
  FILTER = 'filter',
}

@Schema({ timestamps: true })
export class Banner {
  @Prop()
  titleUz: string;

  @Prop()
  titleRu: string;

  @Prop()
  titleEn: string;

  @Prop()
  textUz: string;

  @Prop()
  textRu: string;

  @Prop()
  textEn: string;

  @Prop({ type: [FileMetadata], default: [] })
  images: FileMetadata[];

  @Prop({
    type: [
      {
        categoryId: String,
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
      categoryNameUz: string;
      categoryNameRu: string;
      categoryNameEn: string;
    },
  ];

  @Prop({
    type: {
      slugUz: String,
      slugRu: String,
      slugEn: String,
    },
    default: {},
  })
  product: {
    slugUz: string;
    slugRu: string;
    slugEn: string;
  };

  @Prop({ type: [String], default: [] })
  brandIds: [];

  @Prop({
    type: [
      {
        slugUz: String,
        slugRu: String,
        slugEn: String,
      },
    ],
    default: [],
  })
  brandSlugs: [
    {
      slugUz: string;
      slugRu: string;
      slugEn: string;
    },
  ];

  @Prop({ type: String, enum: BannerTypes })
  type: BannerTypes;

  @Prop({ default: 1 })
  status: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
BannerSchema.index({ titleUz: 1, titleRu: 1, titleEn: 1 });
