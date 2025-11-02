import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  productTitle: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  variantTitle?: string;
}

export class TrackAbandonmentDto {
  @IsString()
  shopId: string;

  @IsString()
  sessionId: string;

  @IsNumber()
  cartValue: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  trafficSource?: string;

  @IsOptional()
  @IsString()
  userLocation?: string;

  @IsOptional()
  @IsString()
  userIp?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  pageUrl?: string;
}
