import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountCode } from './entities/discount-code.entity';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiscountCodesService {
  constructor(
    @InjectRepository(DiscountCode)
    private discountCodesRepository: Repository<DiscountCode>,
  ) {}

  async create(createDto: CreateDiscountCodeDto): Promise<DiscountCode> {
    let code = createDto.code;

    if (!code) {
      code = this.generateCode();
    }

    const discountCode = this.discountCodesRepository.create({
      ...createDto,
      code,
      usageCount: 0,
      isActive: createDto.isActive ?? true,
    });

    return this.discountCodesRepository.save(discountCode);
  }

  async findAll(shopId: string): Promise<DiscountCode[]> {
    return this.discountCodesRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<DiscountCode> {
    const discountCode = await this.discountCodesRepository.findOne({
      where: { id, shopId },
    });

    if (!discountCode) {
      throw new NotFoundException(`Discount code with ID ${id} not found`);
    }

    return discountCode;
  }

  async findByCode(code: string, shopId: string): Promise<DiscountCode | null> {
    return this.discountCodesRepository.findOne({
      where: { code, shopId, isActive: true },
    });
  }

  async incrementUsage(id: string): Promise<void> {
    await this.discountCodesRepository.increment({ id }, 'usageCount', 1);
  }

  private generateCode(): string {
    const prefix = 'POPUP';
    const randomPart = uuidv4().substring(0, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  }
}


