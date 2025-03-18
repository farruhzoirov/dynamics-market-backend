import {BadRequestException} from '@nestjs/common';
import {ErrorCodes} from '../error-codes';

export class VerifyIdTokenException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.ERROR_VERIFYING_ID_TOKEN}`,
      message: message,
    });
  }
}
