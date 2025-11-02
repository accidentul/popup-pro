import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Use in-memory cache only
        // Redis integration can be added later with proper cache-manager v5 compatibility
        // The cache-manager-redis-store v3 has compatibility issues with cache-manager v5
        return {
          ttl: 300, // 5 minutes default TTL
          max: 1000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
