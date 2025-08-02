import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { WorkflowSchema } from './workflow.schema';

@Entity('connections')
@Index(['workflowId'])
@Index(['sourceNodeId'])
@Index(['targetNodeId'])
export class ConnectionSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workflow_id' })
  workflowId: string;

  @ManyToOne(() => WorkflowSchema, workflow => workflow.connections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: WorkflowSchema;

  @Column({ name: 'source_node_id' })
  sourceNodeId: string;

  @Column({ name: 'source_output', length: 50 })
  sourceOutput: string;

  @Column({ name: 'target_node_id' })
  targetNodeId: string;

  @Column({ name: 'target_input', length: 50 })
  targetInput: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
