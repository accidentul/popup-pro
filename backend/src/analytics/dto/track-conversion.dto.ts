import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  Min,
} from 'class-validator';
import { ConversionType } from '../entities/popup-conversion.entity';

export class TrackConversionDto {
  @IsString()
  popupId: string;

  @IsEnum(ConversionType)
  type: ConversionType;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  visitorId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;

  @IsOptional()
  @IsString()
  discountCodeId?: string;

  @IsOptional()
  @IsString()
  emailSubscriberId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}


