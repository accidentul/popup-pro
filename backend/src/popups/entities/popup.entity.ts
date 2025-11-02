import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PopupView } from '../../analytics/entities/popup-view.entity';
import { PopupConversion } from '../../analytics/entities/popup-conversion.entity';

export enum PopupTriggerType {
  EXIT_INTENT = 'exit_intent',
  MOBILE_SCROLL = 'mobile_scroll',
  TIME_DELAY = 'time_delay',
  SCROLL_PERCENTAGE = 'scroll_percentage',
}

export enum PopupStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

@Entity('popups')
export class Popup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PopupStatus,
    default: PopupStatus.DRAFT,
  })
  status: PopupStatus;

  @Column({
    type: 'enum',
    enum: PopupTriggerType,
    default: PopupTriggerType.EXIT_INTENT,
  })
  triggerType: PopupTriggerType;

  @Column('jsonb')
  design: {
    backgroundColor: string;
    textColor: string;
    heading: string;
    subheading: string;
    buttonText: string;
    buttonColor: string;
    imageUrl?: string;
    layout: 'centered' | 'left' | 'right';
    width: number;
    borderRadius: number;
    padding: number;
  };

  @Column('jsonb', { nullable: true })
  targeting: {
    showOnPages: string[];
    excludePages: string[];
    deviceTypes: ('desktop' | 'mobile' | 'tablet')[];
    timeDelay?: number;
    scrollPercentage?: number;
  };

  @Column('jsonb', { nullable: true })
  offer: {
    type: 'discount' | 'email_capture' | 'newsletter' | 'free_shipping';
    discountCodeId?: string;
    discountAmount?: number;
    discountType?: 'percentage' | 'fixed';
    emailListId?: string;
  };

  @Column({ default: 0 })
  viewLimit: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  abTestGroupId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PopupView, (view) => view.popup)
  views: PopupView[];

  @OneToMany(() => PopupConversion, (conversion) => conversion.popup)
  conversions: PopupConversion[];
}


