import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {UserRole} from "../enums/roles.enum";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  lastName: string;

  @Prop()
  image: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.user,
  })
  role: UserRole;
}


export const UserSchema = SchemaFactory.createForClass(User);