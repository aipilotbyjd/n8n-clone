import { Injectable, Logger } from '@nestjs/common';

export interface Variable {
  id: string;
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  scope: 'global' | 'workflow' | 'execution';
  workflowId?: string;
  executionId?: string;
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface VariableRequest {
  name: string;
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'json';
  scope: 'global' | 'workflow' | 'execution';
  workflowId?: string;
  executionId?: string;
  encrypted?: boolean;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private variables = new Map<string, Variable>();
  private scopeIndex = new Map<string, Set<string>>(); // scope -> variable IDs
  
  private stats = {
    totalVariables: 0,
    globalVariables: 0,
    workflowVariables: 0,
    executionVariables: 0,
    encryptedVariables: 0
  };

  getData(): any {
    return { 
      message: 'Variable Manager - Environment and global variable management',
      version: '1.0.0',
      features: [
        'environment-variables',
        'global-variables',
        'workflow-variables',
        'execution-variables',
        'variable-encryption',
        'scoping-rules',
        'type-validation',
        'variable-resolution'
      ],
      stats: this.stats
    };
  }

  async createVariable(request: VariableRequest, userId: string): Promise<string> {
    const variableId = `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const variable: Variable = {
      id: variableId,
      name: request.name,
      value: request.value,
      type: request.type || this.inferType(request.value),
      scope: request.scope,
      workflowId: request.workflowId,
      executionId: request.executionId,
      encrypted: request.encrypted || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId
    };

    // Validate variable
    this.validateVariable(variable);
    
    // Store variable
    this.variables.set(variableId, variable);
    
    // Update scope index
    const scopeKey = this.getScopeKey(variable);
    if (!this.scopeIndex.has(scopeKey)) {
      this.scopeIndex.set(scopeKey, new Set());
    }
    this.scopeIndex.get(scopeKey)!.add(variableId);
    
    // Update stats
    this.updateStats();
    
    this.logger.log(`Created variable ${variable.name} with scope ${variable.scope}`);
    return variableId;
  }

  async updateVariable(variableId: string, updates: Partial<VariableRequest>, userId: string): Promise<void> {
    const variable = this.variables.get(variableId);
    if (!variable) {
      throw new Error(`Variable ${variableId} not found`);
    }

    // Update variable properties
    if (updates.value !== undefined) variable.value = updates.value;
    if (updates.type) variable.type = updates.type;
    if (updates.encrypted !== undefined) variable.encrypted = updates.encrypted;
    variable.updatedAt = new Date();

    // Re-validate
    this.validateVariable(variable);
    
    // Update stats
    this.updateStats();
    
    this.logger.log(`Updated variable ${variable.name}`);
  }

  async deleteVariable(variableId: string): Promise<void> {
    const variable = this.variables.get(variableId);
    if (!variable) {
      throw new Error(`Variable ${variableId} not found`);
    }

    // Remove from scope index
    const scopeKey = this.getScopeKey(variable);
    this.scopeIndex.get(scopeKey)?.delete(variableId);
    
    // Remove variable
    this.variables.delete(variableId);
    
    // Update stats
    this.updateStats();
    
    this.logger.log(`Deleted variable ${variable.name}`);
  }

  async getVariable(variableId: string): Promise<Variable | null> {
    return this.variables.get(variableId) || null;
  }

  async getVariableByName(name: string, scope: string, workflowId?: string, executionId?: string): Promise<Variable | null> {
    for (const variable of this.variables.values()) {
      if (variable.name === name && variable.scope === scope) {
        if (scope === 'workflow' && variable.workflowId === workflowId) {
          return variable;
        } else if (scope === 'execution' && variable.executionId === executionId) {
          return variable;
        } else if (scope === 'global') {
          return variable;
        }
      }
    }
    return null;
  }

  async getVariablesByScope(scope: string, workflowId?: string, executionId?: string): Promise<Variable[]> {
    const scopeKey = scope === 'global' ? 'global' : 
                    scope === 'workflow' ? `workflow:${workflowId}` :
                    `execution:${executionId}`;
    
    const variableIds = this.scopeIndex.get(scopeKey) || new Set();
    return Array.from(variableIds)
      .map(id => this.variables.get(id)!)
      .filter(variable => variable !== undefined);
  }

  async resolveVariables(context: {
    workflowId?: string;
    executionId?: string;
    userId?: string;
  }): Promise<Record<string, any>> {
    const resolved: Record<string, any> = {};
    
    // Global variables (lowest priority)
    const globalVariables = await this.getVariablesByScope('global');
    for (const variable of globalVariables) {
      resolved[variable.name] = this.getVariableValue(variable);
    }
    
    // Workflow variables (medium priority)
    if (context.workflowId) {
      const workflowVariables = await this.getVariablesByScope('workflow', context.workflowId);
      for (const variable of workflowVariables) {
        resolved[variable.name] = this.getVariableValue(variable);
      }
    }
    
    // Execution variables (highest priority)
    if (context.executionId) {
      const executionVariables = await this.getVariablesByScope('execution', undefined, context.executionId);
      for (const variable of executionVariables) {
        resolved[variable.name] = this.getVariableValue(variable);
      }
    }
    
    return resolved;
  }

  async getVariableStats(): Promise<any> {
    return {
      ...this.stats,
      totalActive: this.variables.size,
      scopeBreakdown: {
        global: Array.from(this.variables.values()).filter(v => v.scope === 'global').length,
        workflow: Array.from(this.variables.values()).filter(v => v.scope === 'workflow').length,
        execution: Array.from(this.variables.values()).filter(v => v.scope === 'execution').length
      },
      typeBreakdown: {
        string: Array.from(this.variables.values()).filter(v => v.type === 'string').length,
        number: Array.from(this.variables.values()).filter(v => v.type === 'number').length,
        boolean: Array.from(this.variables.values()).filter(v => v.type === 'boolean').length,
        json: Array.from(this.variables.values()).filter(v => v.type === 'json').length
      }
    };
  }

  private validateVariable(variable: Variable): void {
    if (!variable.name || variable.name.trim() === '') {
      throw new Error('Variable name is required');
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.name)) {
      throw new Error('Variable name must be a valid identifier');
    }
    
    if (variable.scope === 'workflow' && !variable.workflowId) {
      throw new Error('Workflow ID is required for workflow-scoped variables');
    }
    
    if (variable.scope === 'execution' && !variable.executionId) {
      throw new Error('Execution ID is required for execution-scoped variables');
    }
    
    // Validate value matches type
    this.validateValueType(variable.value, variable.type);
  }

  private validateValueType(value: any, type: string): void {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error('Value must be a string');
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          throw new Error('Value must be a number');
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error('Value must be a boolean');
        }
        break;
      case 'json':
        try {
          if (typeof value === 'string') {
            JSON.parse(value);
          } else if (typeof value !== 'object') {
            throw new Error('Value must be a valid JSON object or string');
          }
        } catch (error) {
          throw new Error('Value must be valid JSON');
        }
        break;
    }
  }

  private inferType(value: any): 'string' | 'number' | 'boolean' | 'json' {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'json';
  }

  private getScopeKey(variable: Variable): string {
    switch (variable.scope) {
      case 'global':
        return 'global';
      case 'workflow':
        return `workflow:${variable.workflowId}`;
      case 'execution':
        return `execution:${variable.executionId}`;
      default:
        return 'unknown';
    }
  }

  private getVariableValue(variable: Variable): any {
    if (variable.encrypted) {
      // In real implementation, would decrypt the value
      this.logger.warn(`Variable ${variable.name} is encrypted but decryption not implemented`);
      return '[ENCRYPTED]';
    }
    
    if (variable.type === 'json' && typeof variable.value === 'string') {
      try {
        return JSON.parse(variable.value);
      } catch {
        return variable.value;
      }
    }
    
    return variable.value;
  }

  private updateStats(): void {
    const variables = Array.from(this.variables.values());
    this.stats = {
      totalVariables: variables.length,
      globalVariables: variables.filter(v => v.scope === 'global').length,
      workflowVariables: variables.filter(v => v.scope === 'workflow').length,
      executionVariables: variables.filter(v => v.scope === 'execution').length,
      encryptedVariables: variables.filter(v => v.encrypted).length
    };
  }
}
