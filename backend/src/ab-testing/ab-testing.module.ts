import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ABTestingService } from './ab-testing.service';
import { ABTestingController } from './ab-testing.controller';
import { ABTestGroup } from './entities/ab-test-group.entity';
import { PopupsModule } from '../popups/popups.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ABTestGroup]),
    PopupsModule,
    AnalyticsModule,
  ],
  controllers: [ABTestingController],
  providers: [ABTestingService],
  exports: [ABTestingService],
})
export class ABTestingModule {}


