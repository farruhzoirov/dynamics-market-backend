import {BadRequestException} from "@nestjs/common";
import {ErrorCodes} from "../error-codes";

export class NoTokenProvidedException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.NO_BEARER_TOKEN_PROVIDED}`,
      message: message,
    });
  }
}

export class InvalidTokenException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.INVALID_BEARER_TOKEN}`,
      message: message,
    });
  }
}