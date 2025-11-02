import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { CartAbandonmentEvent } from './entities/cart-abandonment.entity';
import { RecoveryEvent } from './entities/recovery-event.entity';
import { RevenueStatsCache } from './entities/revenue-stats-cache.entity';
import { TrackAbandonmentDto } from './dto/track-abandonment.dto';
import { TrackRecoveryDto } from './dto/track-recovery.dto';

@Injectable()
export class RevenueService {
  constructor(
    @InjectRepository(CartAbandonmentEvent)
    private abandonmentRepo: Repository<CartAbandonmentEvent>,
    @InjectRepository(RecoveryEvent)
    private recoveryRepo: Repository<RecoveryEvent>,
    @InjectRepository(RevenueStatsCache)
    private statsCacheRepo: Repository<RevenueStatsCache>,
  ) {}

  /**
   * Track a cart abandonment event
   */
  async trackAbandonment(dto: TrackAbandonmentDto): Promise<CartAbandonmentEvent> {
    // Save abandonment event
    const event = this.abandonmentRepo.create({
      ...dto,
      recovered: false,
    });

    const savedEvent = await this.abandonmentRepo.save(event);

    // Update stats cache asynchronously (don't block the response)
    this.updateStatsCache(dto.shopId).catch(err =>
      console.error('Failed to update stats cache:', err)
    );

    return savedEvent;
  }

  /**
   * Track a recovery (when popup leads to purchase)
   */
  async trackRecovery(dto: TrackRecoveryDto): Promise<RecoveryEvent> {
    // Mark abandonment as recovered
    await this.abandonmentRepo.update(dto.cartAbandonmentId, {
      recovered: true,
      recoveredAt: new Date(),
      recoveredVia: dto.recoveryMethod,
      popupId: dto.popupId || null,
    });

    // Save recovery event
    const recovery = this.recoveryRepo.create(dto);
    const savedRecovery = await this.recoveryRepo.save(recovery);

    // Update stats cache asynchronously
    this.updateStatsCache(dto.shopId).catch(err =>
      console.error('Failed to update stats cache:', err)
    );

    return savedRecovery;
  }

  /**
   * Get real-time revenue stats
   */
  async getRevenueStats(
    shopId: string,
    period: 'today' | 'week' | 'month' = 'today',
  ): Promise<{
    atRisk: number;
    recovered: number;
    recoveryRate: number;
    abandonedCount: number;
    recoveredCount: number;
  }> {
    // Try cache first
    let cache = await this.statsCacheRepo.findOne({ where: { shopId } });

    // If cache doesn't exist or is stale (older than 5 minutes), recalculate
    if (!cache || this.isCacheStale(cache.lastUpdated)) {
      await this.updateStatsCache(shopId);
      cache = await this.statsCacheRepo.findOne({ where: { shopId } });
    }

    if (!cache) {
      return {
        atRisk: 0,
        recovered: 0,
        recoveryRate: 0,
        abandonedCount: 0,
        recoveredCount: 0,
      };
    }

    // Extract stats for requested period
    return this.extractPeriodStats(cache, period);
  }

  /**
   * Get live activity feed
   */
  async getLiveActivityFeed(shopId: string, limit = 20): Promise<any[]> {
    const events = await this.abandonmentRepo.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['popup'],
    });

    return events.map(event => ({
      id: event.id,
      type: event.recovered ? 'recovery' : 'abandonment',
      value: parseFloat(event.cartValue.toString()),
      items: event.cartItems,
      location: event.userLocation,
      deviceType: event.deviceType,
      trafficSource: event.trafficSource,
      timestamp: event.createdAt,
      recoveredVia: event.recoveredVia,
      popupName: event.popup?.name,
      timeAgo: this.getTimeAgo(event.createdAt),
    }));
  }

  /**
   * Get hourly breakdown for chart
   */
  async getHourlyBreakdown(shopId: string, date: Date = new Date()): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const hourlyData = await this.abandonmentRepo
      .createQueryBuilder('event')
      .select('EXTRACT(HOUR FROM event.created_at)::integer', 'hour')
      .addSelect(
        'COALESCE(SUM(CASE WHEN event.recovered = false THEN event.cart_value ELSE 0 END), 0)',
        'atRisk',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN event.recovered = true THEN event.cart_value ELSE 0 END), 0)',
        'recovered',
      )
      .where('event.shop_id = :shopId', { shopId })
      .andWhere('event.created_at >= :start', { start: startOfDay })
      .andWhere('event.created_at <= :end', { end: endOfDay })
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Fill in missing hours with 0
    const result = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      atRisk: 0,
      recovered: 0,
    }));

    hourlyData.forEach(row => {
      const hour = parseInt(row.hour);
      result[hour] = {
        hour,
        atRisk: parseFloat(row.atRisk) || 0,
        recovered: parseFloat(row.recovered) || 0,
      };
    });

    return result;
  }

  /**
   * Get top performing popups
   */
  async getTopPerformingPopups(shopId: string, limit = 5): Promise<any[]> {
    const popupStats = await this.recoveryRepo
      .createQueryBuilder('recovery')
      .select('recovery.popup_id', 'popupId')
      .addSelect('popup.name', 'popupName')
      .addSelect('COUNT(recovery.id)', 'recoveryCount')
      .addSelect('SUM(recovery.recovery_value)', 'totalRecovered')
      .leftJoin('popups', 'popup', 'popup.id = recovery.popup_id')
      .where('recovery.shop_id = :shopId', { shopId })
      .andWhere('recovery.popup_id IS NOT NULL')
      .groupBy('recovery.popup_id')
      .addGroupBy('popup.name')
      .orderBy('totalRecovered', 'DESC')
      .limit(limit)
      .getRawMany();

    return popupStats.map(stat => ({
      popupId: stat.popupId,
      popupName: stat.popupName || 'Unnamed Popup',
      recoveryCount: parseInt(stat.recoveryCount),
      totalRecovered: parseFloat(stat.totalRecovered) || 0,
    }));
  }

  /**
   * Get conversion breakdown by trigger type
   */
  async getConversionBreakdown(shopId: string): Promise<any[]> {
    const breakdown = await this.recoveryRepo
      .createQueryBuilder('recovery')
      .select('recovery.recovery_method', 'method')
      .addSelect('COUNT(recovery.id)', 'count')
      .addSelect('SUM(recovery.recovery_value)', 'totalValue')
      .where('recovery.shop_id = :shopId', { shopId })
      .groupBy('recovery.recovery_method')
      .orderBy('totalValue', 'DESC')
      .getRawMany();

    const total = breakdown.reduce((sum, item) => sum + parseInt(item.count), 0);

    return breakdown.map(item => ({
      method: item.method,
      count: parseInt(item.count),
      percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0,
      totalValue: parseFloat(item.totalValue) || 0,
    }));
  }

  /**
   * Update stats cache for a shop
   */
  private async updateStatsCache(shopId: string): Promise<void> {
    const now = new Date();

    // Calculate today's stats
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayStats = await this.calculateStats(shopId, todayStart, now);

    // Calculate week's stats
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekStats = await this.calculateStats(shopId, weekStart, now);

    // Calculate month's stats
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthStats = await this.calculateStats(shopId, monthStart, now);

    // Upsert cache
    await this.statsCacheRepo.upsert(
      {
        shopId,
        todayAtRisk: todayStats.atRisk,
        todayRecovered: todayStats.recovered,
        todayRecoveryRate: todayStats.recoveryRate,
        todayAbandonedCount: todayStats.abandonedCount,
        todayRecoveredCount: todayStats.recoveredCount,
        weekAtRisk: weekStats.atRisk,
        weekRecovered: weekStats.recovered,
        weekRecoveryRate: weekStats.recoveryRate,
        weekAbandonedCount: weekStats.abandonedCount,
        weekRecoveredCount: weekStats.recoveredCount,
        monthAtRisk: monthStats.atRisk,
        monthRecovered: monthStats.recovered,
        monthRecoveryRate: monthStats.recoveryRate,
        monthAbandonedCount: monthStats.abandonedCount,
        monthRecoveredCount: monthStats.recoveredCount,
        lastUpdated: now,
      },
      ['shopId'],
    );
  }

  /**
   * Calculate stats for a date range
   */
  private async calculateStats(
    shopId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    atRisk: number;
    recovered: number;
    recoveryRate: number;
    abandonedCount: number;
    recoveredCount: number;
  }> {
    const events = await this.abandonmentRepo.find({
      where: {
        shopId,
        createdAt: Between(startDate, endDate),
      },
    });

    const abandonedCount = events.length;
    const recoveredCount = events.filter(e => e.recovered).length;

    const atRisk = events
      .filter(e => !e.recovered)
      .reduce((sum, e) => sum + parseFloat(e.cartValue.toString()), 0);

    const recovered = events
      .filter(e => e.recovered)
      .reduce((sum, e) => sum + parseFloat(e.cartValue.toString()), 0);

    const recoveryRate = abandonedCount > 0
      ? (recoveredCount / abandonedCount) * 100
      : 0;

    return {
      atRisk,
      recovered,
      recoveryRate: Math.round(recoveryRate * 10) / 10, // Round to 1 decimal
      abandonedCount,
      recoveredCount,
    };
  }

  /**
   * Extract stats for a specific period from cache
   */
  private extractPeriodStats(
    cache: RevenueStatsCache,
    period: 'today' | 'week' | 'month',
  ) {
    const prefix = period;

    return {
      atRisk: parseFloat(cache[`${prefix}AtRisk`]?.toString() || '0'),
      recovered: parseFloat(cache[`${prefix}Recovered`]?.toString() || '0'),
      recoveryRate: parseFloat(cache[`${prefix}RecoveryRate`]?.toString() || '0'),
      abandonedCount: cache[`${prefix}AbandonedCount`] || 0,
      recoveredCount: cache[`${prefix}RecoveredCount`] || 0,
    };
  }

  /**
   * Check if cache is stale (older than 5 minutes)
   */
  private isCacheStale(lastUpdated: Date): boolean {
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    return diff > 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Get time ago string
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }
}
