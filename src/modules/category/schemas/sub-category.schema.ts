import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, Types} from "mongoose";

export type SubCategoryDocument = HydratedDocument<SubCategory>;

@Schema({timestamps: true})
export class SubCategory {
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

  @Prop({type: Types.ObjectId, ref: 'MidCategory'})
  midCategory: Types.ObjectId;

  @Prop({default: 1})
  status: number;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);