import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorCodes } from '../errors/error-codes';

@Injectable()
export class AllExceptionsTo200Interceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    return next.handle().pipe(
      catchError((error) => {
        const errorResponse = {
          success: false,
          errorCode:
            error.response?.errorCode | error.errorCode ||
            ErrorCodes.UNHANDLED_ERROR,
          message: error.message || 'Server Side Error',
        };

        response.status(200).json(errorResponse);
        return throwError(() => error);
      }),
    );
  }
}
