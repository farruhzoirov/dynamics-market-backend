import {BadRequestException} from '@nestjs/common';
import {ErrorCodes} from '../error-codes';

export class ObjectIDException extends BadRequestException {
  constructor(message: string = 'Invalid Mongodb ObjectId!') {
    super({
      errorCode: `${ErrorCodes.INVALID_MONGO_OBJECT_ID}`,
      message: message,
    });
  }
}
