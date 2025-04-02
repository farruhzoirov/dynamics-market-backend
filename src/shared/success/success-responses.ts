import { HttpStatus } from '@nestjs/common';

export class AddedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = 'added successfully') {
    this.errorCode = null;
    this.statusCode = HttpStatus.CREATED;
    this.message = message;
  }
}

export class UpdatedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = 'updated successfully') {
    this.errorCode = null;
    this.statusCode = HttpStatus.OK;
    this.message = message;
  }
}

export class DeletedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = 'deleted successfully') {
    this.errorCode = null;
    this.statusCode = HttpStatus.OK;
    this.message = message;
  }
}

export class FileDeletedSuccessResponse {
  readonly statusCode: number;
  readonly message: string;
  readonly errorCode: null;

  constructor(message: string = ' File deleted successfully') {
    this.errorCode = null;
    this.statusCode = HttpStatus.OK;
    this.message = message;
  }
}
