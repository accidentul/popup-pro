import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const key = this.generateKey(request);
      const limit = this.getLimit(context);
      const ttl = this.getTtl(context);

      // Check if cache manager is properly initialized
      if (!this.cacheManager || typeof this.cacheManager.get !== 'function') {
        // Skip rate limiting if cache is not available
        return true;
      }

      const current = await this.cacheManager.get<number>(key) || 0;

      if (current >= limit) {
        throw new HttpException(
          'Too many requests, please try again later',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.cacheManager.set(key, current + 1, ttl);
      return true;
    } catch (error) {
      // If cache fails, allow the request (fail open)
      if (error instanceof HttpException) {
        throw error;
      }
      console.warn('Rate limit guard error:', error.message);
      return true;
    }
  }

  private generateKey(request: any): string {
    const ip = request.ip || request.connection.remoteAddress;
    const path = request.path;
    return `rate-limit:${ip}:${path}`;
  }

  private getLimit(context: ExecutionContext): number {
    return this.reflector.get<number>('rateLimit', context.getHandler()) || 100;
  }

  private getTtl(context: ExecutionContext): number {
    return this.reflector.get<number>('rateLimitTtl', context.getHandler()) || 60;
  }
}

