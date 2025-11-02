import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';
import { UsageRecord } from './entities/usage.entity';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, UsageRecord]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ShopifyModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}


