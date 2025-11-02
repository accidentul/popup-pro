import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Popup } from '../../popups/entities/popup.entity';

@Entity('popup_views')
export class PopupView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  popupId: string;

  @ManyToOne(() => Popup)
  @JoinColumn({ name: 'popupId' })
  popup: Popup;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  visitorId: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  pageUrl: string;

  @Column({ nullable: true })
  referrer: string;

  @CreateDateColumn()
  viewedAt: Date;
}


