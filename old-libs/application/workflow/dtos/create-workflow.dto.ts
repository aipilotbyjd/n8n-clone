import { IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';
import { NodeParameters, NodeType } from '@n8n-clone/shared';

export class CreateNodeDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: NodeType;

  @IsObject()
  position: {
    x: number;
    y: number;
  };

  @IsOptional()
  @IsObject()
  parameters?: NodeParameters;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateConnectionDto {
  @IsString()
  sourceNodeId: string;

  @IsString()
  targetNodeId: string;

  @IsOptional()
  @IsString()
  sourceOutput?: string;

  @IsOptional()
  @IsString()
  targetInput?: string;

  @IsOptional()
  @IsString()
  type?: 'main' | 'ai';
}

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  nodes: CreateNodeDto[];

  @IsArray()
  connections: CreateConnectionDto[];

  @IsOptional()
  @IsObject()
  settings?: {
    timezone?: string;
    saveDataErrorExecution?: 'all' | 'none';
    saveDataSuccessExecution?: 'all' | 'none';
    saveManualExecutions?: boolean;
    callerPolicy?: 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any';
    callerIds?: string[];
    executionTimeout?: number;
    maxExecutionTimeout?: number;
  };

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsString()
  createdBy: string;
}

export class CreateWorkflowResponseDto {
  id: string;
  name: string;
  description: string;
  version: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export class WorkflowValidationErrorDto {
  field: string;
  message: string;
  code: string;
}

export class CreateWorkflowResponseWithValidationDto {
  success: boolean;
  data?: CreateWorkflowResponseDto;
  errors?: WorkflowValidationErrorDto[];
  warnings?: string[];
}
