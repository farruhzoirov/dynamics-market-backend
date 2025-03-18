import {BadRequestException} from '@nestjs/common';
import {ErrorCodes} from '../error-codes';

export class GettingModelException extends BadRequestException {
  constructor(message: string = 'Error getting model data') {
    super({
      errorCode: `${ErrorCodes.ERROR_GETTING_MODEL_DATA}`,
      message: message,
    });
  }
}

export class AddingModelException extends BadRequestException {
  constructor(message: string = 'Error adding model data') {
    super({
      errorCode: `${ErrorCodes.ERROR_ADDING_MODEL_DATA}`,
      message: message,
    });
  }
}

export class UpdatingModelException extends BadRequestException {
  constructor(message: string = 'Error updating model data') {
    super({
      errorCode: `${ErrorCodes.ERROR_UPDATING_MODEL_DATA}`,
      message: message,
    });
  }
}

export class DeletingModelException extends BadRequestException {
  constructor(message: string = 'Error deleting model data') {
    super({
      errorCode: `${ErrorCodes.ERROR_DELETING_MODEL_DATA}`,
      message: message,
    });
  }
}

export class CantDeleteModelException extends BadRequestException {
  constructor(
      message: string = "Can't delete model data. It may be linked to other child entities.",
  ) {
    super({
      errorCode: `${ErrorCodes.CANT_DELETE_MODEL_DATA}`,
      message: message,
    });
  }
}

export class ModelDataNotFoundByIdException extends BadRequestException {
  constructor(message: string = 'Model data not found') {
    super({
      errorCode: `${ErrorCodes.MODEL_DATA_NOT_FOUND_BY_ID}`,
      message: message,
    });
  }
}
