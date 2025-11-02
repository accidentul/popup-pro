import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSubscriber } from './entities/email-subscriber.entity';
import { CreateEmailSubscriberDto } from './dto/create-email-subscriber.dto';

@Injectable()
export class EmailSubscribersService {
  constructor(
    @InjectRepository(EmailSubscriber)
    private emailSubscribersRepository: Repository<EmailSubscriber>,
  ) {}

  async create(createDto: CreateEmailSubscriberDto): Promise<EmailSubscriber> {
    const existing = await this.emailSubscribersRepository.findOne({
      where: {
        email: createDto.email,
        shopId: createDto.shopId,
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Email already subscribed');
      }
      existing.isActive = true;
      return this.emailSubscribersRepository.save(existing);
    }

    const subscriber = this.emailSubscribersRepository.create({
      ...createDto,
      isActive: true,
    });

    return this.emailSubscribersRepository.save(subscriber);
  }

  async findAll(shopId: string): Promise<EmailSubscriber[]> {
    return this.emailSubscribersRepository.find({
      where: { shopId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPopup(popupId: string): Promise<EmailSubscriber[]> {
    return this.emailSubscribersRepository.find({
      where: { popupId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async count(shopId: string): Promise<number> {
    return this.emailSubscribersRepository.count({
      where: { shopId, isActive: true },
    });
  }

  async unsubscribe(email: string, shopId: string): Promise<void> {
    const subscriber = await this.emailSubscribersRepository.findOne({
      where: { email, shopId },
    });

    if (subscriber) {
      subscriber.isActive = false;
      await this.emailSubscribersRepository.save(subscriber);
    }
  }
}


