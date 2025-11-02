import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PopupTriggerType, PopupStatus } from '../entities/popup.entity';

class DesignDto {
  @IsString()
  backgroundColor: string;

  @IsString()
  textColor: string;

  @IsString()
  heading: string;

  @IsString()
  subheading: string;

  @IsString()
  buttonText: string;

  @IsString()
  buttonColor: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(['centered', 'left', 'right'])
  layout: 'centered' | 'left' | 'right';

  @IsNumber()
  @Min(200)
  @Max(1200)
  width: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  borderRadius: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  padding: number;
}

class TargetingDto {
  @IsArray()
  @IsString({ each: true })
  showOnPages: string[];

  @IsArray()
  @IsString({ each: true })
  excludePages: string[];

  @IsArray()
  @IsEnum(['desktop', 'mobile', 'tablet'], { each: true })
  deviceTypes: ('desktop' | 'mobile' | 'tablet')[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeDelay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  scrollPercentage?: number;
}

class OfferDto {
  @IsEnum(['discount', 'email_capture', 'newsletter', 'free_shipping'])
  type: 'discount' | 'email_capture' | 'newsletter' | 'free_shipping';

  @IsOptional()
  @IsString()
  discountCodeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsEnum(['percentage', 'fixed'])
  discountType?: 'percentage' | 'fixed';

  @IsOptional()
  @IsString()
  emailListId?: string;
}

export class CreatePopupDto {
  @IsString()
  shopId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PopupStatus)
  status?: PopupStatus;

  @IsEnum(PopupTriggerType)
  triggerType: PopupTriggerType;

  @ValidateNested()
  @Type(() => DesignDto)
  @IsObject()
  design: DesignDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TargetingDto)
  @IsObject()
  targeting?: TargetingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OfferDto)
  @IsObject()
  offer?: OfferDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewLimit?: number;

  @IsOptional()
  @IsString()
  abTestGroupId?: string;
}


