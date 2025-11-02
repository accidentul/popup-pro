import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailSubscribersService } from './email-subscribers.service';
import { EmailSubscribersController } from './email-subscribers.controller';
import { EmailSubscriber } from './entities/email-subscriber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailSubscriber])],
  controllers: [EmailSubscribersController],
  providers: [EmailSubscribersService],
  exports: [EmailSubscribersService],
})
export class EmailSubscribersModule {}


