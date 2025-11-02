import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PopupView } from './entities/popup-view.entity';
import { PopupConversion } from './entities/popup-conversion.entity';
import { TrackViewDto } from './dto/track-view.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { PopupsService } from '../popups/popups.service';

@Injectable()
export class AnalyticsService {
  private readonly STATS_CACHE_TTL = 60; // 1 minute cache for stats
  private readonly STATS_CACHE_KEY = (popupId: string) => `stats:popup:${popupId}`;
  private readonly SHOP_STATS_CACHE_KEY = (shopId: string) => `stats:shop:${shopId}`;

  constructor(
    @InjectRepository(PopupView)
    private popupViewsRepository: Repository<PopupView>,
    @InjectRepository(PopupConversion)
    private popupConversionsRepository: Repository<PopupConversion>,
    private popupsService: PopupsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async trackView(trackViewDto: TrackViewDto): Promise<PopupView> {
    // Use bulk insert for better performance
    const view = this.popupViewsRepository.create(trackViewDto);
    const savedView = await this.popupViewsRepository.save(view);

    // Increment view count asynchronously to not block response
    this.popupsService.incrementViewCount(trackViewDto.popupId).catch(console.error);

    // Invalidate stats cache
    await this.cacheManager.del(this.STATS_CACHE_KEY(trackViewDto.popupId));

    return savedView;
  }

  async trackConversion(
    trackConversionDto: TrackConversionDto,
  ): Promise<PopupConversion> {
    const conversion = this.popupConversionsRepository.create(
      trackConversionDto,
    );
    const saved = await this.popupConversionsRepository.save(conversion);

    // Invalidate stats cache
    await this.cacheManager.del(this.STATS_CACHE_KEY(trackConversionDto.popupId));

    return saved;
  }

  async getPopupStats(popupId: string): Promise<{
    popupId: string;
    views: number;
    conversions: number;
    conversionRate: number;
    totalRevenue: number;
    conversionsByType: Record<string, number>;
  }> {
    const cacheKey = this.STATS_CACHE_KEY(popupId);
    const cached = await this.cacheManager.get<{
      popupId: string;
      views: number;
      conversions: number;
      conversionRate: number;
      totalRevenue: number;
      conversionsByType: Record<string, number>;
    }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Use efficient queries with aggregation
    const [views, conversions] = await Promise.all([
      this.popupViewsRepository.count({ where: { popupId } }),
      this.popupConversionsRepository
        .createQueryBuilder('conversion')
        .select('conversion.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(conversion.revenue), 0)', 'totalRevenue')
        .where('conversion.popupId = :popupId', { popupId })
        .groupBy('conversion.type')
        .getRawMany(),
    ]);

    const conversionCount = conversions.reduce(
      (sum, conv) => sum + parseInt(conv.count),
      0,
    );
    const conversionRate =
      views > 0 ? (conversionCount / views) * 100 : 0;

    const totalRevenue = conversions.reduce(
      (sum, conv) => sum + parseFloat(conv.totalRevenue || 0),
      0,
    );

    const conversionsByType = conversions.reduce((acc, conv) => {
      acc[conv.type] = parseInt(conv.count);
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      popupId,
      views,
      conversions: conversionCount,
      conversionRate: Number(conversionRate.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      conversionsByType,
    };

    await this.cacheManager.set(cacheKey, stats, this.STATS_CACHE_TTL);
    return stats;
  }

  async getShopStats(shopId: string) {
    const cacheKey = this.SHOP_STATS_CACHE_KEY(shopId);
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const popups = await this.popupsService.findAll(shopId);
    const popupIds = popups.map((p) => p.id);

    if (popupIds.length === 0) {
      const emptyStats = {
        shopId,
        totalPopups: 0,
        totalViews: 0,
        totalConversions: 0,
        averageConversionRate: 0,
      };
      await this.cacheManager.set(cacheKey, emptyStats, this.STATS_CACHE_TTL);
      return emptyStats;
    }

    // Use efficient aggregation queries
    const [totalViews, totalConversions] = await Promise.all([
      this.popupViewsRepository
        .createQueryBuilder('view')
        .where('view.popupId IN (:...popupIds)', { popupIds })
        .getCount(),
      this.popupConversionsRepository
        .createQueryBuilder('conversion')
        .where('conversion.popupId IN (:...popupIds)', { popupIds })
        .getCount(),
    ]);

    const stats = {
      shopId,
      totalPopups: popups.length,
      totalViews,
      totalConversions,
      averageConversionRate:
        totalViews > 0 ? Number(((totalConversions / totalViews) * 100).toFixed(2)) : 0,
    };

    await this.cacheManager.set(cacheKey, stats, this.STATS_CACHE_TTL);
    return stats;
  }
}
