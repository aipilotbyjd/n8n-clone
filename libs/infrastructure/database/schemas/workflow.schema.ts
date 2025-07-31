import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { NodeSchema } from './node.schema';
import { ConnectionSchema } from './connection.schema';

@Entity('workflows')
@Index(['userId', 'active'])
@Index(['name', 'userId'])
export class WorkflowSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ default: false })
  active: boolean;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ default: 1 })
  version: number;

  @OneToMany(() => NodeSchema, node => node.workflow, { cascade: true })
  nodes: NodeSchema[];

  @OneToMany(() => ConnectionSchema, connection => connection.workflow, { cascade: true })
  connections: ConnectionSchema[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
