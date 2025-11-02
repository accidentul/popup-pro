import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CartAbandonmentEvent } from './cart-abandonment.entity';
import { Popup } from '../../popups/entities/popup.entity';

@Entity('recovery_events')
@Index(['shopId', 'createdAt'])
export class RecoveryEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cartAbandonmentId: string;

  @ManyToOne(() => CartAbandonmentEvent)
  @JoinColumn({ name: 'cartAbandonmentId' })
  cartAbandonment: CartAbandonmentEvent;

  @Column()
  @Index()
  shopId: string;

  @Column({ type: 'uuid', nullable: true })
  popupId: string;

  @ManyToOne(() => Popup, { nullable: true })
  @JoinColumn({ name: 'popupId' })
  popup: Popup;

  @Column('decimal', { precision: 10, scale: 2 })
  recoveryValue: number;

  @Column()
  recoveryMethod: string; // 'exit_popup', 'email_campaign', 'sms', 'time_delay_popup'

  @Column({ nullable: true })
  offerUsed: string; // Discount code or offer type applied

  @CreateDateColumn()
  createdAt: Date;
}
