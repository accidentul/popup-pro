import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmailSubscribersService } from './email-subscribers.service';
import { CreateEmailSubscriberDto } from './dto/create-email-subscriber.dto';

@Controller('email-subscribers')
export class EmailSubscribersController {
  constructor(
    private readonly emailSubscribersService: EmailSubscribersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateEmailSubscriberDto) {
    return this.emailSubscribersService.create(createDto);
  }

  @Get()
  findAll(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.emailSubscribersService.findAll(shopId);
  }

  @Get('count')
  async count(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    const count = await this.emailSubscribersService.count(shopId);
    return { count };
  }

  @Get('popup/:popupId')
  findByPopup(@Param('popupId') popupId: string) {
    return this.emailSubscribersService.findByPopup(popupId);
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.NO_CONTENT)
  unsubscribe(
    @Body('email') email: string,
    @Query('shopId') shopId: string,
  ) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.emailSubscribersService.unsubscribe(email, shopId);
  }
}

