import { Controller, Get, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PlanType } from './entities/subscription.entity';
import { PLAN_PRICING } from './entities/plan-limits.entity';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('status')
  async getStatus(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.subscriptionsService.getSubscriptionDetails(shopId);
  }

  @Get('limits')
  async getLimits(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.subscriptionsService.getPlanLimits(shopId);
  }

  @Get('usage')
  async getUsage(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new Error('shopId is required');
    }
    return this.subscriptionsService.getCurrentUsage(shopId);
  }

  @Post('upgrade')
  async upgrade(@Body() body: { shopId: string; planType: PlanType }) {
    const { shopId, planType } = body;
    if (!shopId || !planType) {
      throw new Error('shopId and planType are required');
    }

    const confirmationUrl = await this.subscriptionsService.createBillingCharge(shopId, planType);
    return { confirmationUrl };
  }

  @Post('activate')
  async activate(@Body() body: { shopId: string; chargeId: string }) {
    const { shopId, chargeId } = body;
    await this.subscriptionsService.activateBillingCharge(shopId, chargeId);
    return { success: true };
  }

  @Post('cancel')
  async cancel(@Body() body: { shopId: string }) {
    const { shopId } = body;
    await this.subscriptionsService.cancelSubscription(shopId);
    return { success: true };
  }

  @Get('plans')
  getPlans() {
    return {
      plans: Object.entries(PLAN_PRICING).map(([key, pricing]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        ...pricing,
        limits: PLAN_PRICING[key] ? PLAN_PRICING[key] : null,
      })),
    };
  }
}


