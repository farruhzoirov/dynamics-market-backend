import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();

    // Get cache metadata from decorator
    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, handler);
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, handler) || 300;

    // Skip caching for non-GET requests
    if (request.method !== 'GET' || !cacheKey) {
      return next.handle();
    }

    const fullCacheKey = this.generateCacheKey(request, cacheKey);

    try {
      // Try to get cached response
      const cachedResponse = await this.cacheManager.get(fullCacheKey);
      if (cachedResponse) {
        return of(cachedResponse);
      }

      // Execute the handler and cache the response
      return next.handle().pipe(
        tap(async (response) => {
          if (response && typeof response === 'object') {
            await this.cacheManager.set(fullCacheKey, response, cacheTTL * 1000);
          }
        }),
      );
    } catch (error) {
      // If caching fails, continue without caching
      return next.handle();
    }
  }

  private generateCacheKey(request: Request, baseKey: string): string {
    const { url, query, headers } = request;
    const lang = headers['accept-language'] || 'en';
    const userAgent = headers['user-agent'] || '';
    
    // Create a deterministic cache key
    const keyParts = [
      baseKey,
      url,
      JSON.stringify(query),
      lang.substring(0, 2), // Take first 2 chars of language
    ];

    return keyParts.join(':').replace(/[^a-zA-Z0-9:_-]/g, '_');
  }
}