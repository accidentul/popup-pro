import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { PopupsModule } from './popups/popups.module';
import { DiscountCodesModule } from './discount-codes/discount-codes.module';
import { EmailSubscribersModule } from './email-subscribers/email-subscribers.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ABTestingModule } from './ab-testing/ab-testing.module';
import { ShopifyModule } from './shopify/shopify.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RevenueModule } from './revenue/revenue.module';
import { HealthController } from './health/health.controller';
import { ScriptsController } from './scripts/scripts.controller';
import { CacheModule } from './cache/cache.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_URL?.startsWith('sqlite') ? 'sqlite' : 'postgres',
      ...(process.env.DATABASE_URL?.startsWith('sqlite')
        ? { database: ':memory:' }
        : { 
            url: process.env.DATABASE_URL,
            extra: {
              max: parseInt(process.env.DB_POOL_MAX || '20'),
              min: parseInt(process.env.DB_POOL_MIN || '5'),
              idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
              connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
            },
          }),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    PopupsModule,
    DiscountCodesModule,
    EmailSubscribersModule,
    AnalyticsModule,
    ABTestingModule,
    ShopifyModule,
    SubscriptionsModule,
    RevenueModule,
    CacheModule,
  ],
  controllers: [HealthController, ScriptsController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}

