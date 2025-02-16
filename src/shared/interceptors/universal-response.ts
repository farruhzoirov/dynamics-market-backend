import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AllExceptionsTo200Interceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
        catchError((error) => {
          // Barcha xatolarni 200 status bilan qaytaramiz
          const ctx = context.switchToHttp();
          const response = ctx.getResponse();

          // Error ni qayta tuzamiz
          const errorResponse = {
            success: false,
            errorCode: error.response?.errorCode || 'UNKNOWN_ERROR',
            message: error.message || 'Something went wrong',
          };

          response.status(200).json(errorResponse);
          return throwError(() => error);
        }),
    );
  }
}
