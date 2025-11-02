import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PopupView } from './entities/popup-view.entity';
import { PopupConversion } from './entities/popup-conversion.entity';
import { PopupsModule } from '../popups/popups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PopupView, PopupConversion]),
    PopupsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}


