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
import { DiscountCodesService } from './discount-codes.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';

@Controller('discount-codes')
export class DiscountCodesController {
  constructor(private readonly discountCodesService: DiscountCodesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateDiscountCodeDto) {
    return this.discountCodesService.create(createDto);
  }

  @Get()
  findAll(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.discountCodesService.findAll(shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.discountCodesService.findOne(id, shopId);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string, @Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.discountCodesService.findByCode(code, shopId);
  }
}


