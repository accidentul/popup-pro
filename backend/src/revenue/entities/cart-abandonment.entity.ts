import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Popup } from '../../popups/entities/popup.entity';

@Entity('cart_abandonment_events')
@Index(['shopId', 'createdAt'])
@Index(['shopId', 'recovered', 'createdAt'])
export class CartAbandonmentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  shopId: string;

  @Column()
  sessionId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cartValue: number;

  @Column('jsonb')
  cartItems: {
    productId?: string;
    productTitle: string;
    quantity: number;
    price: number;
    variantTitle?: string;
  }[];

  @Column({ default: false })
  @Index()
  recovered: boolean;

  @Column({ type: 'timestamp', nullable: true })
  recoveredAt: Date;

  @Column({ nullable: true })
  recoveredVia: string; // 'popup', 'email', 'sms', null

  @Column({ type: 'uuid', nullable: true })
  popupId: string;

  @ManyToOne(() => Popup, { nullable: true })
  @JoinColumn({ name: 'popupId' })
  popup: Popup;

  // User context
  @Column({ nullable: true })
  deviceType: string; // 'desktop', 'mobile', 'tablet'

  @Column({ nullable: true })
  trafficSource: string; // 'google', 'facebook', 'direct', etc.

  @Column({ nullable: true })
  userLocation: string; // "City, State"

  @Column({ nullable: true })
  userIp: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  pageUrl: string; // URL where abandonment occurred

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
