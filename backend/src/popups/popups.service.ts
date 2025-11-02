import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Popup, PopupStatus } from './entities/popup.entity';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PopupsService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly ACTIVE_POPUPS_CACHE_KEY = (shopId: string) => `active-popups:${shopId}`;
  private readonly POPUP_CACHE_KEY = (id: string) => `popup:${id}`;

  constructor(
    @InjectRepository(Popup)
    private popupsRepository: Repository<Popup>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => SubscriptionsService))
    private subscriptionsService: SubscriptionsService,
  ) {}

  async create(createPopupDto: CreatePopupDto): Promise<Popup> {
    // Check popup limit
    const canCreate = await this.subscriptionsService.checkLimit(createPopupDto.shopId, 'popups');
    if (!canCreate) {
      const limits = await this.subscriptionsService.getPlanLimits(createPopupDto.shopId);
      throw new ForbiddenException(
        `Plan limit reached. You can create up to ${limits.maxPopups} popup(s). Upgrade your plan to create more.`
      );
    }

    const popup = this.popupsRepository.create({
      ...createPopupDto,
      status: createPopupDto.status || PopupStatus.DRAFT,
      viewCount: 0,
      isActive: createPopupDto.status === PopupStatus.ACTIVE,
      targeting: createPopupDto.targeting || {
        showOnPages: [],
        excludePages: [],
        deviceTypes: ['desktop', 'mobile', 'tablet'],
      },
    });

    const saved = await this.popupsRepository.save(popup);
    
    // Update popup count
    const allPopups = await this.findAll(createPopupDto.shopId);
    await this.subscriptionsService.updatePopupCount(createPopupDto.shopId, allPopups.length);
    
    // Invalidate cache
    await this.cacheManager.del(this.ACTIVE_POPUPS_CACHE_KEY(createPopupDto.shopId));
    
    return saved;
  }

  async findAll(shopId: string): Promise<Popup[]> {
    return this.popupsRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
      take: 100, // Limit to prevent excessive data transfer
    });
  }

  async findOne(id: string, shopId: string): Promise<Popup> {
    const cacheKey = this.POPUP_CACHE_KEY(id);
    const cached = await this.cacheManager.get<Popup>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const popup = await this.popupsRepository.findOne({
      where: { id, shopId },
    });

    if (!popup) {
      throw new NotFoundException(`Popup with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, popup, this.CACHE_TTL);
    return popup;
  }

  async update(
    id: string,
    shopId: string,
    updatePopupDto: UpdatePopupDto,
  ): Promise<Popup> {
    const popup = await this.findOne(id, shopId);

    Object.assign(popup, updatePopupDto);

    if ('status' in updatePopupDto && updatePopupDto.status !== undefined) {
      popup.isActive = updatePopupDto.status === PopupStatus.ACTIVE;
    }

    const saved = await this.popupsRepository.save(popup);

    // Invalidate caches
    await this.cacheManager.del(this.POPUP_CACHE_KEY(id));
    await this.cacheManager.del(this.ACTIVE_POPUPS_CACHE_KEY(shopId));

    return saved;
  }

  async remove(id: string, shopId: string): Promise<void> {
    const popup = await this.findOne(id, shopId);
    await this.popupsRepository.remove(popup);

    // Invalidate caches
    await this.cacheManager.del(this.POPUP_CACHE_KEY(id));
    await this.cacheManager.del(this.ACTIVE_POPUPS_CACHE_KEY(shopId));
  }

  async incrementViewCount(id: string): Promise<void> {
    // Use increment to avoid race conditions
    await this.popupsRepository.increment({ id }, 'viewCount', 1);
    
    // Invalidate cache to refresh view count
    const popup = await this.popupsRepository.findOne({ where: { id } });
    if (popup) {
      await this.cacheManager.del(this.POPUP_CACHE_KEY(id));
      await this.cacheManager.del(this.ACTIVE_POPUPS_CACHE_KEY(popup.shopId));
    }
  }

  async getActivePopups(shopId: string): Promise<Popup[]> {
    const cacheKey = this.ACTIVE_POPUPS_CACHE_KEY(shopId);
    const cached = await this.cacheManager.get<Popup[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const popups = await this.popupsRepository.find({
      where: {
        shopId,
        status: PopupStatus.ACTIVE,
        isActive: true,
      },
      take: 50, // Limit active popups per shop
    });

    await this.cacheManager.set(cacheKey, popups, this.CACHE_TTL);
    return popups;
  }
}
