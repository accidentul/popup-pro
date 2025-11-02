import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

export class CreateEmailSubscriberDto {
  @IsString()
  shopId: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  popupId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}


