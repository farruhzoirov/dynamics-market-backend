import {HttpStatus} from "@nestjs/common";

export class CreatedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = "Model data added successfully") {
    this.errorCode = null;
    this.statusCode = HttpStatus.CREATED
    this.message = message
  }
}

export class UpdatedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = "Model data updated successfully",) {
    this.errorCode = null;
    this.statusCode = HttpStatus.OK;
    this.message = message;
  }
}


export class DeletedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = "Model data deleted successfully",) {
    this.errorCode = null;
    this.statusCode = HttpStatus.OK;
    this.message = message;
  }
}


export class FileDeletedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = " File deleted successfully",) {
    this.errorCode = null;
    this.statusCode = HttpStatus.OK;
    this.message = message;
  }
}

