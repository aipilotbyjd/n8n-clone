import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('workflows')
@Index('idx_workflows_user_active', ['userId', 'active'])
@Index('idx_workflows_name_user', ['name', 'userId'])
@Index('idx_workflows_tags', { synchronize: false }) // Manually enable GIN indexing
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('uuid')
  userId: string;

  @Column({ default: false })
  active: boolean;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.workflows)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'jsonb' })
  nodes: any[];

  @Column({ type: 'jsonb' })
  connections: any[];

  // Additional metadata fields
  @Column({ name: 'execution_count', type: 'int', default: 0 })
  executionCount: number;

  @Column({ name: 'last_execution_at', type: 'timestamp', nullable: true })
  lastExecutionAt?: Date;

  @Column({ name: 'last_execution_status', length: 50, nullable: true })
  lastExecutionStatus?: string;

  @Column({ name: 'webhook_id', length: 255, nullable: true })
  webhookId?: string;

  @Column({ name: 'static_data', type: 'jsonb', nullable: true })
  staticData?: any;

  @Column({ name: 'pinned_data', type: 'jsonb', nullable: true })
  pinnedData?: any;

  @Column({ name: 'versionId', length: 255, nullable: true })
  versionId?: string;
}
