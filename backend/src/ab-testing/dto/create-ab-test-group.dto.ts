import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ABTestStatus } from '../entities/ab-test-group.entity';

export class CreateABTestGroupDto {
  @IsString()
  shopId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ABTestStatus)
  status?: ABTestStatus;

  @IsArray()
  @IsString({ each: true })
  popupIds: string[];

  @IsObject()
  trafficSplit: Record<string, number>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}


