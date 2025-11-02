import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShopifyController } from './shopify.controller';
import { ShopifyService } from './shopify.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Shop]),
  ],
  controllers: [ShopifyController],
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class ShopifyModule {}

