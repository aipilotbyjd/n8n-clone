import { Injectable, Logger } from '@nestjs/common';

export interface FlowDecision {
  shouldContinue: boolean;
  nextNodes: string[];
  reason?: string;
}

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'exists';
  value: any;
  combineOperation?: 'AND' | 'OR';
}

@Injectable()
export class FlowControlService {
  private readonly logger = new Logger(FlowControlService.name);

  async evaluateIfCondition(
    data: any,
    conditions: ConditionalRule[]
  ): Promise<FlowDecision> {
    this.logger.debug('Evaluating IF condition');

    try {
      const result = this.evaluateConditions(data, conditions);
      
      return {
        shouldContinue: result,
        nextNodes: result ? ['true'] : ['false'],
        reason: `Condition evaluated to ${result}`
      };
    } catch (error) {
      this.logger.error('Error evaluating IF condition:', error);
      return {
        shouldContinue: false,
        nextNodes: ['false'],
        reason: `Error: ${error.message}`
      };
    }
  }

  async evaluateSwitchCondition(
    data: any,
    switchValue: string,
    cases: Record<string, any>
  ): Promise<FlowDecision> {
    this.logger.debug('Evaluating Switch condition');

    try {
      const value = this.extractValue(data, switchValue);
      const matchingCase = Object.keys(cases).find(caseKey => {
        return cases[caseKey] === value;
      });

      return {
        shouldContinue: true,
        nextNodes: matchingCase ? [matchingCase] : ['default'],
        reason: `Switch value "${value}" matched case "${matchingCase || 'default'}"`
      };
    } catch (error) {
      this.logger.error('Error evaluating Switch condition:', error);
      return {
        shouldContinue: true,
        nextNodes: ['default'],
        reason: `Error: ${error.message}`
      };
    }
  }

  private evaluateConditions(data: any, conditions: ConditionalRule[]): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    let result = this.evaluateSingleCondition(data, conditions[0]);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateSingleCondition(data, condition);

      if (condition.combineOperation === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  private evaluateSingleCondition(data: any, condition: ConditionalRule): boolean {
    const fieldValue = this.extractValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater':
        return Number(fieldValue) > Number(condition.value);
      case 'less':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      default:
        return false;
    }
  }

  private extractValue(data: any, path: string): any {
    if (!path) return data;

    const keys = path.split('.');
    let value = data;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }
}
