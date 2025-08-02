import { IsUUID, IsOptional, IsString } from 'class-validator';

export class WorkflowQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string; // Can search in name, description

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;

  @IsOptional()
  sortBy?: 'createdAt' | 'updatedAt' | 'name';

  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class WorkflowSummaryDto {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  active: boolean;
}

export class GetWorkflowByIdDto {
  @IsUUID()
  workflowId: string;
}

export class GetWorkflowByIdResponseDto {
  id: string;
  name: string;
  description: string;
  nodes: any[]; // Assuming a generic type for nodes and connections
  connections: any[];
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  active: boolean;
}
