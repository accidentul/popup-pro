import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class TrackRecoveryDto {
  @IsUUID()
  cartAbandonmentId: string;

  @IsString()
  shopId: string;

  @IsOptional()
  @IsUUID()
  popupId?: string;

  @IsNumber()
  recoveryValue: number;

  @IsString()
  recoveryMethod: string;

  @IsOptional()
  @IsString()
  offerUsed?: string;
}
