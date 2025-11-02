import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackViewDto } from './dto/track-view.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { RateLimit } from '../common/decorators/rate-limit.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('views')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit(1000, 60) // 1000 requests per minute for tracking
  trackView(@Body() trackViewDto: TrackViewDto) {
    return this.analyticsService.trackView(trackViewDto);
  }

  @Post('conversions')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit(500, 60) // 500 requests per minute for conversions
  trackConversion(@Body() trackConversionDto: TrackConversionDto) {
    return this.analyticsService.trackConversion(trackConversionDto);
  }

  @Get('popup/:popupId')
  @RateLimit(100, 60) // 100 requests per minute for stats
  getPopupStats(@Param('popupId') popupId: string) {
    return this.analyticsService.getPopupStats(popupId);
  }

  @Get('shop/:shopId')
  @RateLimit(100, 60) // 100 requests per minute for stats
  getShopStats(@Param('shopId') shopId: string) {
    return this.analyticsService.getShopStats(shopId);
  }
}
