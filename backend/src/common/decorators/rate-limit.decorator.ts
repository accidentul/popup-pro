import { SetMetadata } from '@nestjs/common';

export const RateLimit = (limit: number, ttl: number = 60) =>
  SetMetadata('rateLimit', limit);

export const RateLimitTtl = (ttl: number) => SetMetadata('rateLimitTtl', ttl);


