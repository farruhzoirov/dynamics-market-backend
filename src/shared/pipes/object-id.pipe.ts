import {ArgumentMetadata,  PipeTransform} from "@nestjs/common";
import mongoose from "mongoose";
import {ObjectIDException} from "../errors/pipe/object-id.exception";

export class ValidateObjectIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new ObjectIDException();
    }
    return value;
  }
}
