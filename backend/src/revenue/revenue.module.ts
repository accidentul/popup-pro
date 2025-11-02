import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { RevenueGateway } from './revenue.gateway';
import { CartAbandonmentEvent } from './entities/cart-abandonment.entity';
import { RecoveryEvent } from './entities/recovery-event.entity';
import { RevenueStatsCache } from './entities/revenue-stats-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartAbandonmentEvent,
      RecoveryEvent,
      RevenueStatsCache,
    ]),
  ],
  controllers: [RevenueController],
  providers: [RevenueService, RevenueGateway],
  exports: [RevenueService, RevenueGateway],
})
export class RevenueModule {}
