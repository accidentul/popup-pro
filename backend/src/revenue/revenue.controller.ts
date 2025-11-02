import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { RevenueGateway } from './revenue.gateway';
import { TrackAbandonmentDto } from './dto/track-abandonment.dto';
import { TrackRecoveryDto } from './dto/track-recovery.dto';

@Controller('revenue')
export class RevenueController {
  constructor(
    private readonly revenueService: RevenueService,
    private readonly revenueGateway: RevenueGateway,
  ) {}

  /**
   * Track a cart abandonment
   */
  @Post('track-abandonment')
  @HttpCode(HttpStatus.CREATED)
  async trackAbandonment(@Body() dto: TrackAbandonmentDto) {
    const event = await this.revenueService.trackAbandonment(dto);

    // Emit real-time event
    this.revenueGateway.emitCartAbandoned(dto.shopId, {
      id: event.id,
      value: parseFloat(event.cartValue.toString()),
      items: event.cartItems,
      location: event.userLocation,
      deviceType: event.deviceType,
      trafficSource: event.trafficSource,
      timestamp: event.createdAt,
    });

    return { success: true, eventId: event.id };
  }

  /**
   * Track a cart recovery
   */
  @Post('track-recovery')
  @HttpCode(HttpStatus.CREATED)
  async trackRecovery(@Body() dto: TrackRecoveryDto) {
    const recovery = await this.revenueService.trackRecovery(dto);

    // Emit real-time event
    this.revenueGateway.emitCartRecovered(dto.shopId, {
      id: recovery.id,
      value: parseFloat(recovery.recoveryValue.toString()),
      popupId: dto.popupId,
      recoveryMethod: dto.recoveryMethod,
      timestamp: recovery.createdAt,
    });

    // Update and emit stats
    const stats = await this.revenueService.getRevenueStats(dto.shopId, 'today');
    this.revenueGateway.emitStatsUpdate(dto.shopId, stats);

    return { success: true, recoveryId: recovery.id };
  }

  /**
   * Get revenue stats
   */
  @Get('stats')
  async getStats(
    @Query('shopId') shopId: string,
    @Query('period') period: 'today' | 'week' | 'month' = 'today',
  ) {
    if (!shopId) {
      throw new BadRequestException('shopId is required');
    }

    return this.revenueService.getRevenueStats(shopId, period);
  }

  /**
   * Get live activity feed
   */
  @Get('activity-feed')
  async getActivityFeed(
    @Query('shopId') shopId: string,
    @Query('limit') limit?: string,
  ) {
    if (!shopId) {
      throw new BadRequestException('shopId is required');
    }

    const limitNum = limit ? parseInt(limit) : 20;
    return this.revenueService.getLiveActivityFeed(shopId, limitNum);
  }

  /**
   * Get hourly breakdown for chart
   */
  @Get('hourly-breakdown')
  async getHourlyBreakdown(
    @Query('shopId') shopId: string,
    @Query('date') date?: string,
  ) {
    if (!shopId) {
      throw new BadRequestException('shopId is required');
    }

    const dateObj = date ? new Date(date) : new Date();
    return this.revenueService.getHourlyBreakdown(shopId, dateObj);
  }

  /**
   * Get top performing popups
   */
  @Get('top-popups')
  async getTopPopups(
    @Query('shopId') shopId: string,
    @Query('limit') limit?: string,
  ) {
    if (!shopId) {
      throw new BadRequestException('shopId is required');
    }

    const limitNum = limit ? parseInt(limit) : 5;
    return this.revenueService.getTopPerformingPopups(shopId, limitNum);
  }

  /**
   * Get conversion breakdown
   */
  @Get('conversion-breakdown')
  async getConversionBreakdown(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new BadRequestException('shopId is required');
    }

    return this.revenueService.getConversionBreakdown(shopId);
  }
}
