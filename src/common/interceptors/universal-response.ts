import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AllExceptionsTo200Interceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    return next.handle().pipe(
      // map((data) => {
      //   const successResponse = {
      //     success: true,
      //     ...data,
      //   };
      //   response.status(200).json(successResponse);
      // }),

      catchError((error) => {
        const errorResponse = {
          success: false,
          errorCode: error.response?.errorCode | error.errorCode || null,
          message: error.message || 'Server Side Error',
        };

        response.status(200).json(errorResponse);
        return throwError(() => error);
      }),
    );
  }
}
