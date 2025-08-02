import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { WorkflowSchema } from './workflow.schema';

@Entity('nodes')
@Index(['workflowId'])
export class NodeSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workflow_id' })
  workflowId: string;

  @ManyToOne(() => WorkflowSchema, workflow => workflow.nodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: WorkflowSchema;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  position: { x: number; y: number };

  @Column({ name: 'credential_id', nullable: true })
  credentialId: string;

  @Column({ default: false })
  disabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
