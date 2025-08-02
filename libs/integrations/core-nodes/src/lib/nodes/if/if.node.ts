import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class IfNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.if',
    displayName: 'IF',
    name: 'if',
    group: ['transform'],
    version: 1,
    description: 'Conditional logic node',
    defaults: {
      name: 'IF'
    },
    inputs: ['main'],
    outputs: ['main', 'main'],
    properties: [
      {
        displayName: 'Conditions',
        name: 'conditions',
        type: 'fixedCollection',
        default: {},
        description: 'The conditions to check',
        options: [
          {
            name: 'boolean',
            value: [
              {
                displayName: 'Value 1',
                name: 'value1',
                type: 'boolean',
                default: false,
                description: 'The first boolean value to compare'
              },
              {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                  { name: 'Equal', value: 'equal' },
                  { name: 'Not Equal', value: 'notEqual' }
                ],
                default: 'equal',
                description: 'The comparison operation'
              },
              {
                displayName: 'Value 2',
                name: 'value2',
                type: 'boolean',
                default: false,
                description: 'The second boolean value to compare'
              }
            ]
          },
          {
            name: 'number',
            value: [
              {
                displayName: 'Value 1',
                name: 'value1',
                type: 'number',
                default: 0,
                description: 'The first number to compare'
              },
              {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                  { name: 'Equal', value: 'equal' },
                  { name: 'Not Equal', value: 'notEqual' },
                  { name: 'Smaller', value: 'smaller' },
                  { name: 'Smaller Equal', value: 'smallerEqual' },
                  { name: 'Larger', value: 'larger' },
                  { name: 'Larger Equal', value: 'largerEqual' }
                ],
                default: 'equal',
                description: 'The comparison operation'
              },
              {
                displayName: 'Value 2',
                name: 'value2',
                type: 'number',
                default: 0,
                description: 'The second number to compare'
              }
            ]
          },
          {
            name: 'string',
            value: [
              {
                displayName: 'Value 1',
                name: 'value1',
                type: 'string',
                default: '',
                description: 'The first string to compare'
              },
              {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                  { name: 'Equal', value: 'equal' },
                  { name: 'Not Equal', value: 'notEqual' },
                  { name: 'Contains', value: 'contains' },
                  { name: 'Not Contains', value: 'notContains' },
                  { name: 'Starts With', value: 'startsWith' },
                  { name: 'Not Starts With', value: 'notStartsWith' },
                  { name: 'Ends With', value: 'endsWith' },
                  { name: 'Not Ends With', value: 'notEndsWith' },
                  { name: 'Regex', value: 'regex' }
                ],
                default: 'equal',
                description: 'The comparison operation'
              },
              {
                displayName: 'Value 2',
                name: 'value2',
                type: 'string',
                default: '',
                description: 'The second string to compare'
              }
            ]
          }
        ]
      },
      {
        displayName: 'Combine',
        name: 'combineOperation',
        type: 'options',
        options: [
          { name: 'AND', value: 'all' },
          { name: 'OR', value: 'any' }
        ],
        default: 'all',
        description: 'How to combine multiple conditions'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const trueItems: INodeExecutionData[] = [];
    const falseItems: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const conditions = context.getNodeParameter('conditions', itemIndex, {}) as any;
      const combineOperation = context.getNodeParameter('combineOperation', itemIndex, 'all') as string;

      const results: boolean[] = [];

      // Evaluate boolean conditions
      if (conditions.boolean) {
        for (const condition of conditions.boolean) {
          const result = this.evaluateBooleanCondition(condition);
          results.push(result);
        }
      }

      // Evaluate number conditions
      if (conditions.number) {
        for (const condition of conditions.number) {
          const result = this.evaluateNumberCondition(condition);
          results.push(result);
        }
      }

      // Evaluate string conditions
      if (conditions.string) {
        for (const condition of conditions.string) {
          const result = this.evaluateStringCondition(condition);
          results.push(result);
        }
      }

      // Combine results
      let finalResult = false;
      if (results.length > 0) {
        if (combineOperation === 'all') {
          finalResult = results.every(r => r);
        } else {
          finalResult = results.some(r => r);
        }
      }

      // Route to appropriate output
      if (finalResult) {
        trueItems.push(items[itemIndex]);
      } else {
        falseItems.push(items[itemIndex]);
      }
    }

    return [trueItems, falseItems];
  }

  private evaluateBooleanCondition(condition: any): boolean {
    const { value1, operation, value2 } = condition;
    
    switch (operation) {
      case 'equal':
        return value1 === value2;
      case 'notEqual':
        return value1 !== value2;
      default:
        return false;
    }
  }

  private evaluateNumberCondition(condition: any): boolean {
    const { value1, operation, value2 } = condition;
    
    switch (operation) {
      case 'equal':
        return value1 === value2;
      case 'notEqual':
        return value1 !== value2;
      case 'smaller':
        return value1 < value2;
      case 'smallerEqual':
        return value1 <= value2;
      case 'larger':
        return value1 > value2;
      case 'largerEqual':
        return value1 >= value2;
      default:
        return false;
    }
  }

  private evaluateStringCondition(condition: any): boolean {
    const { value1, operation, value2 } = condition;
    
    switch (operation) {
      case 'equal':
        return value1 === value2;
      case 'notEqual':
        return value1 !== value2;
      case 'contains':
        return value1.includes(value2);
      case 'notContains':
        return !value1.includes(value2);
      case 'startsWith':
        return value1.startsWith(value2);
      case 'notStartsWith':
        return !value1.startsWith(value2);
      case 'endsWith':
        return value1.endsWith(value2);
      case 'notEndsWith':
        return !value1.endsWith(value2);
      case 'regex':
        try {
          const regex = new RegExp(value2);
          return regex.test(value1);
        } catch {
          return false;
        }
      default:
        return false;
    }
  }
}
