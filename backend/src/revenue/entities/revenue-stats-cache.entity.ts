import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('revenue_stats_cache')
export class RevenueStatsCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  shopId: string;

  // Today's stats
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  todayAtRisk: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  todayRecovered: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  todayRecoveryRate: number;

  @Column({ default: 0 })
  todayAbandonedCount: number;

  @Column({ default: 0 })
  todayRecoveredCount: number;

  // This week
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  weekAtRisk: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  weekRecovered: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  weekRecoveryRate: number;

  @Column({ default: 0 })
  weekAbandonedCount: number;

  @Column({ default: 0 })
  weekRecoveredCount: number;

  // This month
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  monthAtRisk: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  monthRecovered: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  monthRecoveryRate: number;

  @Column({ default: 0 })
  monthAbandonedCount: number;

  @Column({ default: 0 })
  monthRecoveredCount: number;

  @UpdateDateColumn()
  lastUpdated: Date;
}
