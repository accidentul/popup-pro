import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Subscription, PlanType, SubscriptionStatus } from './entities/subscription.entity';
import { UsageRecord } from './entities/usage.entity';
import { PLAN_LIMITS, PLAN_PRICING } from './entities/plan-limits.entity';
import { ShopifyService } from '../shopify/shopify.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(UsageRecord)
    private usageRepository: Repository<UsageRecord>,
    private shopifyService: ShopifyService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getOrCreateSubscription(shopId: string): Promise<Subscription> {
    let subscription = await this.subscriptionRepository.findOne({
      where: { shopId },
    });

    if (!subscription) {
      // For demo shops (not connected to real Shopify stores), create a virtual subscription
      // This avoids foreign key constraint errors since demo-shop doesn't exist in shops table
      if (shopId === 'demo-shop' || shopId.startsWith('demo-')) {
        // Return a virtual subscription object for demo purposes
        return {
          id: 'demo-subscription',
          shopId,
          planType: PlanType.FREE,
          status: SubscriptionStatus.ACTIVE,
          shopifyChargeId: null,
          shopifyBillingId: null,
          trialEndsAt: null,
          currentPeriodEnd: null,
          cancelledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Subscription;
      }

      // For real shops, create actual subscription (requires shop to exist in database)
      try {
        subscription = this.subscriptionRepository.create({
          shopId,
          planType: PlanType.FREE,
          status: SubscriptionStatus.ACTIVE,
        });
        subscription = await this.subscriptionRepository.save(subscription);
      } catch (error) {
        // If foreign key constraint fails, the shop doesn't exist
        console.error(`Failed to create subscription for shop ${shopId}:`, error.message);
        throw new BadRequestException(
          'Shop not found. Please connect your Shopify store first at /install'
        );
      }
    }

    // Check if subscription is expired
    if (
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd < new Date() &&
      subscription.status === SubscriptionStatus.ACTIVE
    ) {
      subscription.status = SubscriptionStatus.EXPIRED;
      subscription = await this.subscriptionRepository.save(subscription);
    }

    return subscription;
  }

  async getPlanLimits(shopId: string): Promise<any> {
    const subscription = await this.getOrCreateSubscription(shopId);
    const planKey = subscription.planType.toLowerCase();
    return PLAN_LIMITS[planKey] || PLAN_LIMITS.free;
  }

  async checkLimit(shopId: string, limitType: 'popups' | 'views'): Promise<boolean> {
    const subscription = await this.getOrCreateSubscription(shopId);
    const limits = await this.getPlanLimits(shopId);
    const currentUsage = await this.getCurrentUsage(shopId);

    if (limitType === 'popups') {
      if (limits.maxPopups === -1) return true; // Unlimited
      return currentUsage.popupCount < limits.maxPopups;
    }

    if (limitType === 'views') {
      if (limits.maxViewsPerMonth === -1) return true; // Unlimited
      return currentUsage.popupViews < limits.maxViewsPerMonth;
    }

    return false;
  }

  async getCurrentUsage(shopId: string): Promise<{
    popupCount: number;
    popupViews: number;
    popupConversions: number;
  }> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let usage = await this.usageRepository.findOne({
      where: { shopId, month, year },
    });

    if (!usage) {
      // For demo shops, return default usage without saving to DB
      if (shopId === 'demo-shop' || shopId.startsWith('demo-')) {
        return {
          popupCount: 0,
          popupViews: 0,
          popupConversions: 0,
        };
      }

      usage = this.usageRepository.create({
        shopId,
        month,
        year,
        popupViews: 0,
        popupConversions: 0,
        popupCount: 0,
      });
      await this.usageRepository.save(usage);
    }

    return {
      popupCount: usage.popupCount,
      popupViews: usage.popupViews,
      popupConversions: usage.popupConversions,
    };
  }

  async incrementUsage(shopId: string, type: 'view' | 'conversion'): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let usage = await this.usageRepository.findOne({
      where: { shopId, month, year },
    });

    if (!usage) {
      usage = this.usageRepository.create({
        shopId,
        month,
        year,
        popupViews: 0,
        popupConversions: 0,
        popupCount: 0,
      });
    }

    if (type === 'view') {
      usage.popupViews += 1;
    } else if (type === 'conversion') {
      usage.popupConversions += 1;
    }

    await this.usageRepository.save(usage);
  }

  async updatePopupCount(shopId: string, count: number): Promise<void> {
    // Skip usage tracking for demo shops
    if (shopId === 'demo-shop' || shopId.startsWith('demo-')) {
      return;
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let usage = await this.usageRepository.findOne({
      where: { shopId, month, year },
    });

    if (!usage) {
      usage = this.usageRepository.create({
        shopId,
        month,
        year,
        popupViews: 0,
        popupConversions: 0,
        popupCount: 0,
      });
    }

    usage.popupCount = count;
    await this.usageRepository.save(usage);
  }

  async createBillingCharge(shopId: string, planType: PlanType): Promise<string> {
    const shop = await this.shopifyService.getShop(shopId);
    if (!shop || !shop.accessToken) {
      throw new ForbiddenException('Shop not authenticated');
    }

    const plan = PLAN_PRICING[planType.toLowerCase()];
    if (!plan) {
      throw new BadRequestException('Invalid plan type');
    }

    const returnUrl = `${this.configService.get('FRONTEND_URL')}/billing/callback?shopId=${shopId}`;
    const name = `ExitIntent Pro - ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${shop.shopDomain}/admin/api/2024-01/recurring_application_charges.json`,
          {
            recurring_application_charge: {
              name,
              price: plan.price,
              return_url: returnUrl,
              test: this.configService.get('NODE_ENV') !== 'production',
            },
          },
          {
            headers: {
              'X-Shopify-Access-Token': shop.accessToken,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const charge = response.data.recurring_application_charge;
      return charge.confirmation_url;
    } catch (error) {
      console.error('Failed to create billing charge:', error);
      throw new BadRequestException('Failed to create billing charge');
    }
  }

  async activateBillingCharge(shopId: string, chargeId: string): Promise<void> {
    const shop = await this.shopifyService.getShop(shopId);
    if (!shop || !shop.accessToken) {
      throw new ForbiddenException('Shop not authenticated');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${shop.shopDomain}/admin/api/2024-01/recurring_application_charges/${chargeId}/activate.json`,
          {},
          {
            headers: {
              'X-Shopify-Access-Token': shop.accessToken,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const charge = response.data.recurring_application_charge;
      
      // Update subscription
      const subscription = await this.getOrCreateSubscription(shopId);
      subscription.planType = this.getPlanTypeFromCharge(charge.name);
      subscription.shopifyChargeId = charge.id.toString();
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.currentPeriodEnd = new Date(charge.billing_on);
      subscription.currentPeriodEnd.setMonth(subscription.currentPeriodEnd.getMonth() + 1);
      
      await this.subscriptionRepository.save(subscription);
    } catch (error) {
      console.error('Failed to activate billing charge:', error);
      throw new BadRequestException('Failed to activate billing charge');
    }
  }

  private getPlanTypeFromCharge(chargeName: string): PlanType {
    if (chargeName.includes('Starter')) return PlanType.STARTER;
    if (chargeName.includes('Professional')) return PlanType.PROFESSIONAL;
    if (chargeName.includes('Enterprise')) return PlanType.ENTERPRISE;
    return PlanType.FREE;
  }

  async cancelSubscription(shopId: string): Promise<void> {
    const subscription = await this.getOrCreateSubscription(shopId);
    
    if (subscription.shopifyChargeId) {
      const shop = await this.shopifyService.getShop(shopId);
      if (shop && shop.accessToken) {
        try {
          await firstValueFrom(
            this.httpService.delete(
              `https://${shop.shopDomain}/admin/api/2024-01/recurring_application_charges/${subscription.shopifyChargeId}.json`,
              {
                headers: {
                  'X-Shopify-Access-Token': shop.accessToken,
                },
              }
            )
          );
        } catch (error) {
          console.error('Failed to cancel Shopify charge:', error);
        }
      }
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.planType = PlanType.FREE;
    await this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionDetails(shopId: string): Promise<any> {
    const subscription = await this.getOrCreateSubscription(shopId);
    const limits = await this.getPlanLimits(shopId);
    const usage = await this.getCurrentUsage(shopId);
    const planPricing = PLAN_PRICING[subscription.planType.toLowerCase()];

    return {
      subscription: {
        id: subscription.id,
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt,
      },
      limits,
      usage,
      pricing: planPricing,
    };
  }
}


