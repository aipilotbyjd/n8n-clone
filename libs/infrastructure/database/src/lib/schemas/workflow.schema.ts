import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('workflows')
export class WorkflowSchema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('jsonb')
  nodes!: any[];

  @Column({ default: false })
  active!: boolean;

  @Column()
  triggerNodeId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
