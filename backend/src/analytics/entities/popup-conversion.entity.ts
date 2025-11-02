import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Popup } from '../../popups/entities/popup.entity';

export enum ConversionType {
  EMAIL_CAPTURE = 'email_capture',
  DISCOUNT_CODE_USED = 'discount_code_used',
  CLICK = 'click',
  PURCHASE = 'purchase',
}

@Entity('popup_conversions')
export class PopupConversion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  popupId: string;

  @ManyToOne(() => Popup)
  @JoinColumn({ name: 'popupId' })
  popup: Popup;

  @Column({
    type: 'enum',
    enum: ConversionType,
  })
  type: ConversionType;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  visitorId: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  revenue: number;

  @Column({ nullable: true })
  discountCodeId: string;

  @Column({ nullable: true })
  emailSubscriberId: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  convertedAt: Date;
}


