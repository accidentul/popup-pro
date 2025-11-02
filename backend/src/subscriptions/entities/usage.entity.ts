import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('usage_records')
@Index(['shopId', 'month', 'year'])
export class UsageRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column()
  month: number; // 1-12

  @Column()
  year: number;

  @Column({ default: 0 })
  popupViews: number;

  @Column({ default: 0 })
  popupConversions: number;

  @Column({ default: 0 })
  popupCount: number; // Number of active popups

  @CreateDateColumn()
  createdAt: Date;
}


