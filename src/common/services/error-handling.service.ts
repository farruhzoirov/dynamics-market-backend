import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { ERROR_MESSAGES } from '../constants/application.constants';

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);

  /**
   * Handle database operation errors consistently
   */
  handleDatabaseError(operation: string, error: Error, context?: string): never {
    const contextInfo = context ? ` in ${context}` : '';
    this.logger.error(
      `Database operation failed: ${operation}${contextInfo}`,
      error.stack,
    );
    
    // Check for specific database errors
    if (error.message.includes('duplicate key')) {
      throw new ConflictException(`Duplicate entry found during ${operation}`);
    }
    
    if (error.message.includes('validation failed')) {
      throw new BadRequestException(`Validation failed during ${operation}`);
    }
    
    throw new InternalServerErrorException(ERROR_MESSAGES.OPERATION_FAILED(operation));
  }

  /**
   * Handle entity not found scenarios
   */
  handleNotFound(entity: string, identifier: string): never {
    this.logger.warn(`${entity} not found: ${identifier}`);
    throw new NotFoundException(ERROR_MESSAGES.ENTITY_NOT_FOUND(entity, identifier));
  }

  /**
   * Handle validation errors with detailed context
   */
  handleValidationError(message: string, details?: unknown): never {
    this.logger.warn(`Validation error: ${message}`, details);
    throw new BadRequestException(message);
  }

  /**
   * Handle unauthorized access attempts
   */
  handleUnauthorized(action: string, userId?: string): never {
    const userContext = userId ? ` for user ${userId}` : '';
    this.logger.warn(`Unauthorized access attempt: ${action}${userContext}`);
    throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
  }

  /**
   * Validate MongoDB ObjectId format
   */
  validateObjectId(id: string, entityName: string): void {
    if (!id) {
      throw new BadRequestException(ERROR_MESSAGES.REQUIRED_FIELD(`${entityName} ID`));
    }
    
    if (!isValidObjectId(id)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_ID_FORMAT(entityName));
    }
  }

  /**
   * Validate required fields
   */
  validateRequiredField(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new BadRequestException(ERROR_MESSAGES.REQUIRED_FIELD(fieldName));
    }
  }

  /**
   * Validate array fields
   */
  validateArrayField(value: any[], fieldName: string, minLength = 1): void {
    if (!Array.isArray(value) || value.length < minLength) {
      throw new BadRequestException(
        `${fieldName} must be an array with at least ${minLength} item(s)`,
      );
    }
  }

  /**
   * Handle and re-throw HTTP exceptions, wrap others
   */
  handleServiceError(error: Error, operation: string, context?: string): never {
    if (error instanceof HttpException) {
      throw error;
    }
    
    this.handleDatabaseError(operation, error, context);
  }

  /**
   * Log and handle soft errors (non-critical operations)
   */
  logSoftError(message: string, error: Error, context?: string): void {
    const contextInfo = context ? ` [${context}]` : '';
    this.logger.warn(`Soft error${contextInfo}: ${message}`, error.message);
  }

  /**
   * Validate pagination parameters
   */
  validatePaginationParams(page?: number, limit?: number): { page: number; limit: number } {
    const validatedPage = page && page > 0 ? page : 1;
    const validatedLimit = limit && limit > 0 && limit <= 100 ? limit : 12;
    
    return { page: validatedPage, limit: validatedLimit };
  }

  /**
   * Validate language parameter
   */
  validateLanguage(lang: string): string {
    const validLanguages = ['Uz', 'Ru', 'En'];
    if (!validLanguages.includes(lang)) {
      throw new BadRequestException(`Invalid language. Must be one of: ${validLanguages.join(', ')}`);
    }
    return lang;
  }
}