import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class SwitchNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.switch',
    displayName: 'Switch',
    name: 'switch',
    group: ['transform'],
    version: 1,
    description: 'Routes data to different outputs based on rules',
    defaults: {
      name: 'Switch'
    },
    inputs: ['main'],
    outputs: ['main', 'main', 'main', 'main'], // Default 4 outputs
    properties: [
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'options',
        options: [
          { name: 'Expression', value: 'expression' },
          { name: 'Rules', value: 'rules' }
        ],
        default: 'rules',
        description: 'How to determine the output to use'
      },
      {
        displayName: 'Output',
        name: 'output',
        type: 'string',
        displayOptions: {
          show: {
            mode: ['expression']
          }
        },
        default: '0',
        description: 'Expression that determines which output to use'
      },
      {
        displayName: 'Rules',
        name: 'rules',
        type: 'fixedCollection',
        displayOptions: {
          show: {
            mode: ['rules']
          }
        },
        default: { values: [] },
        options: [
          {
            name: 'values',
            value: [
              {
                displayName: 'Conditions',
                name: 'conditions',
                type: 'fixedCollection',
                default: {},
                options: [
                  {
                    name: 'string',
                    value: [
                      {
                        displayName: 'Value 1',
                        name: 'value1',
                        type: 'string',
                        default: '',
                        description: 'The first value to compare'
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
                          { name: 'Ends With', value: 'endsWith' },
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
                        description: 'The second value to compare'
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
                  }
                ]
              },
              {
                displayName: 'Output',
                name: 'output',
                type: 'number',
                default: 0,
                description: 'The output index to route to (0-based)'
              }
            ]
          }
        ]
      },
      {
        displayName: 'Fallback Output',
        name: 'fallbackOutput',
        type: 'number',
        default: 3,
        description: 'Output to use when no rules match'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const mode = context.getNodeParameter('mode', 0, 'rules') as string;
    const fallbackOutput = context.getNodeParameter('fallbackOutput', 0, 3) as number;
    
    // Initialize outputs
    const outputs: INodeExecutionData[][] = [[], [], [], []];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      let outputIndex = fallbackOutput;

      if (mode === 'expression') {
        // Expression mode
        const outputExpression = context.getNodeParameter('output', itemIndex, '0') as string;
        try {
          // Simple expression evaluation - in real implementation would use proper expression parser
          outputIndex = parseInt(outputExpression) || 0;
        } catch (error) {
          outputIndex = fallbackOutput;
        }
      } else {
        // Rules mode
        const rules = context.getNodeParameter('rules', itemIndex, { values: [] }) as any;
        
        for (const rule of rules.values || []) {
          if (this.evaluateRule(rule, items[itemIndex])) {
            outputIndex = rule.output || 0;
            break;
          }
        }
      }

      // Ensure output index is valid
      outputIndex = Math.max(0, Math.min(outputIndex, outputs.length - 1));
      outputs[outputIndex].push(items[itemIndex]);
    }

    return outputs;
  }

  private evaluateRule(rule: any, item: INodeExecutionData): boolean {
    const conditions = rule.conditions || {};
    const results: boolean[] = [];

    // Evaluate string conditions
    if (conditions.string) {
      for (const condition of conditions.string) {
        const result = this.evaluateStringCondition(condition, item);
        results.push(result);
      }
    }

    // Evaluate number conditions
    if (conditions.number) {
      for (const condition of conditions.number) {
        const result = this.evaluateNumberCondition(condition, item);
        results.push(result);
      }
    }

    // Return true if any condition matches (OR logic)
    return results.length === 0 || results.some(r => r);
  }

  private evaluateStringCondition(condition: any, item: INodeExecutionData): boolean {
    const { value1, operation, value2 } = condition;
    
    // Resolve values from item data if needed
    const resolvedValue1 = this.resolveValue(value1, item);
    const resolvedValue2 = this.resolveValue(value2, item);
    
    switch (operation) {
      case 'equal':
        return resolvedValue1 === resolvedValue2;
      case 'notEqual':
        return resolvedValue1 !== resolvedValue2;
      case 'contains':
        return String(resolvedValue1).includes(String(resolvedValue2));
      case 'notContains':
        return !String(resolvedValue1).includes(String(resolvedValue2));
      case 'startsWith':
        return String(resolvedValue1).startsWith(String(resolvedValue2));
      case 'endsWith':
        return String(resolvedValue1).endsWith(String(resolvedValue2));
      case 'regex':
        try {
          const regex = new RegExp(String(resolvedValue2));
          return regex.test(String(resolvedValue1));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  private evaluateNumberCondition(condition: any, item: INodeExecutionData): boolean {
    const { value1, operation, value2 } = condition;
    
    const resolvedValue1 = Number(this.resolveValue(value1, item));
    const resolvedValue2 = Number(this.resolveValue(value2, item));
    
    switch (operation) {
      case 'equal':
        return resolvedValue1 === resolvedValue2;
      case 'notEqual':
        return resolvedValue1 !== resolvedValue2;
      case 'smaller':
        return resolvedValue1 < resolvedValue2;
      case 'smallerEqual':
        return resolvedValue1 <= resolvedValue2;
      case 'larger':
        return resolvedValue1 > resolvedValue2;
      case 'largerEqual':
        return resolvedValue1 >= resolvedValue2;
      default:
        return false;
    }
  }

  private resolveValue(value: any, item: INodeExecutionData): any {
    // Simple value resolution - in real implementation would handle expressions
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2).trim();
      return this.getValueFromPath(item.json, path);
    }
    return value;
  }

  private getValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
