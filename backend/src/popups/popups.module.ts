import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopupsService } from './popups.service';
import { PopupsController } from './popups.controller';
import { Popup } from './entities/popup.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Popup]),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [PopupsController],
  providers: [PopupsService],
  exports: [PopupsService],
})
export class PopupsModule {}

