import {BadRequestException} from "@nestjs/common";
import {ErrorCodes} from "../error-codes";

export class NoFileUploadedException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.NO_FILE_UPLOADED}`,
      message: message,
    });
  }
}

export class InvalidFileTypeException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.INVALID_FILE_TYPE}`,
      message: message,
    });
  }
}


export class FileSizeLargerException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.FILE_TOO_LARGE}`,
      message: message,
    });
  }
}

export class FileNotFoundException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.FILE_NOT_FOUND}`,
      message: message,
    });
  }
}


export class InvalidFilePathException extends BadRequestException {
  constructor(message: string) {
    super({
      errorCode: `${ErrorCodes.INVALID_FILE_PATH}`,
      message: message,
    });
  }
}




