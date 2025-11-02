import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ABTestGroup, ABTestStatus } from './entities/ab-test-group.entity';
import { CreateABTestGroupDto } from './dto/create-ab-test-group.dto';
import { PopupsService } from '../popups/popups.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ABTestingService {
  constructor(
    @InjectRepository(ABTestGroup)
    private abTestGroupsRepository: Repository<ABTestGroup>,
    private popupsService: PopupsService,
    private analyticsService: AnalyticsService,
  ) {}

  async create(createDto: CreateABTestGroupDto): Promise<ABTestGroup> {
    const group = this.abTestGroupsRepository.create({
      ...createDto,
      status: createDto.status || ABTestStatus.DRAFT,
      totalVisitors: 0,
    });

    return this.abTestGroupsRepository.save(group);
  }

  async findAll(shopId: string): Promise<ABTestGroup[]> {
    return this.abTestGroupsRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<ABTestGroup> {
    const group = await this.abTestGroupsRepository.findOne({
      where: { id, shopId },
    });

    if (!group) {
      throw new NotFoundException(`AB test group with ID ${id} not found`);
    }

    return group;
  }

  async getTestResults(groupId: string, shopId: string) {
    const group = await this.findOne(groupId, shopId);

    const results = await Promise.all(
      group.popupIds.map(async (popupId) => {
        const stats = await this.analyticsService.getPopupStats(popupId);
        return {
          popupId,
          views: stats.views,
          conversions: stats.conversions,
          conversionRate: stats.conversionRate,
          totalRevenue: stats.totalRevenue,
          conversionsByType: stats.conversionsByType,
          trafficPercentage: group.trafficSplit[popupId] || 0,
        };
      }),
    );

    return {
      group,
      results,
      winner: group.winnerPopupId
        ? results.find((r) => r.popupId === group.winnerPopupId)
        : null,
    };
  }

  async selectWinner(groupId: string, shopId: string, popupId: string) {
    const group = await this.findOne(groupId, shopId);

    if (!group.popupIds.includes(popupId)) {
      throw new Error('Popup is not part of this test group');
    }

    group.winnerPopupId = popupId;
    group.status = ABTestStatus.COMPLETED;

    return this.abTestGroupsRepository.save(group);
  }

  async incrementVisitor(groupId: string): Promise<void> {
    await this.abTestGroupsRepository.increment({ id: groupId }, 'totalVisitors', 1);
  }

  async assignPopupToVisitor(
    groupId: string,
    visitorId: string,
  ): Promise<string> {
    const group = await this.abTestGroupsRepository.findOne({
      where: { id: groupId, status: ABTestStatus.RUNNING },
    });

    if (!group) {
      return null;
    }

    await this.incrementVisitor(groupId);

    const hash = this.hashString(visitorId + groupId);
    const percentage = (hash % 100) / 100;

    let cumulative = 0;
    for (const popupId of group.popupIds) {
      cumulative += (group.trafficSplit[popupId] || 0) / 100;
      if (percentage <= cumulative) {
        return popupId;
      }
    }

    return group.popupIds[0];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

