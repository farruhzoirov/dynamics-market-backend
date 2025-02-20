import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";
import mongoose from "mongoose";
import {ObjectIDException} from "../errors/pipe/object-id.exception";


@Injectable()
export class ValidateObjectIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      throw new ObjectIDException();
    }
    return value;
  }
}
