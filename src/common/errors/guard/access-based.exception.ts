import {BadRequestException} from "@nestjs/common";
import {ErrorCodes} from "../error-codes";

export class AccessDeniedException extends BadRequestException {
  constructor(message: string = "Access denied") {
    super({
      errorCode: `${ErrorCodes.ACCESS_DENIED}`,
      message: message,
    });
  }
}