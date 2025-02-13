import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

export type MainCategoryDocument = HydratedDocument<MainCategory>;

@Schema({timestamps: true})
export class MainCategory {
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
}


export const MainCategorySchema = SchemaFactory.createForClass(MainCategory);