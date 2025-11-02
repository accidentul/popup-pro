import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  shopId: string;

  @Column()
  shopDomain: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ default: false })
  isInstalled: boolean;

  @Column({ nullable: true })
  scriptInstalled: boolean;

  @Column({ nullable: true })
  scriptUrl: string;

  @Column('jsonb', { nullable: true })
  shopifyData: {
    name?: string;
    email?: string;
    plan?: string;
    currency?: string;
    timezone?: string;
  };

  @CreateDateColumn()
  installedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


