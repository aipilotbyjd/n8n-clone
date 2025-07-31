import { IExecuteFunctions, INodeExecutionData, INodeParameters, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class If implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'IF',
    name: 'if',
    icon: 'fa:map-signs',
    group: ['transform'],
    version: 1,
    description: 'Split the workflow based on conditions',
    defaults: {
      name: 'IF',
      color: '#408000',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main, NodeConnectionType.Main],
    outputNames: ['true', 'false'],
    properties: [
      {
        displayName: 'Conditions',
        name: 'conditions',
        placeholder: 'Add Condition',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        description: 'The conditions to check',
        default: {},
        options: [
          {
            name: 'boolean',
            displayName: 'Boolean',
            values: [
              {
                displayName: 'Value 1',
                name: 'value1',
                type: 'string',
                default: '',
                description: 'The first value to compare',
              },
              {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                  {
                    name: 'Equal',
                    value: 'equal',
                  },
                  {
                    name: 'Not Equal',
                    value: 'notEqual',
                  },
                  {
                    name: 'Contains',
                    value: 'contains',
                  },
                  {
                    name: 'Not Contains',
                    value: 'notContains',
                  },
                  {
                    name: 'Starts With',
                    value: 'startsWith',
                  },
                  {
                    name: 'Ends With',
                    value: 'endsWith',
                  },
                  {
                    name: 'Regex',
                    value: 'regex',
                  },
                ],
                default: 'equal',
                description: 'Operation to decide what the condition is',
              },
              {
                displayName: 'Value 2',
                name: 'value2',
                type: 'string',
                default: '',
                description: 'The second value to compare',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Combine',
        name: 'combineOperation',
        type: 'options',
        options: [
          {
            name: 'AND',
            description: 'Only if all conditions are met it goes into "true" branch',
            value: 'all',
          },
          {
            name: 'OR',
            description: 'If any condition is met it goes into "true" branch',
            value: 'any',
          },
        ],
        default: 'all',
        description: 'How to combine the conditions',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnDataTrue: INodeExecutionData[] = [];
    const returnDataFalse: INodeExecutionData[] = [];

    let item: INodeExecutionData;
    let combineOperation: string;

    // The logic of the node
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      item = items[itemIndex];
      combineOperation = this.getNodeParameter('combineOperation', itemIndex) as string;

      const conditions = this.getNodeParameter('conditions.boolean', itemIndex, []) as INodeParameters[];

      let conditionResult = true;

      if (combineOperation === 'all') {
        // AND operation - all conditions must be true
        conditionResult = conditions.every((condition) => 
          this.evaluateCondition(condition, item.json)
        );
      } else if (combineOperation === 'any') {
        // OR operation - at least one condition must be true  
        conditionResult = conditions.some((condition) => 
          this.evaluateCondition(condition, item.json)
        );
      }

      if (conditionResult === true) {
        returnDataTrue.push(item);
      } else {
        returnDataFalse.push(item);
      }
    }

    return [returnDataTrue, returnDataFalse];
  }

  private evaluateCondition(condition: INodeParameters, data: any): boolean {
    const value1 = String(condition.value1 || '');
    const value2 = String(condition.value2 || '');
    const operation = condition.operation as string;

    // Resolve expressions in values
    const resolvedValue1 = this.resolveValue(value1, data);
    const resolvedValue2 = this.resolveValue(value2, data);

    switch (operation) {
      case 'equal':
        return resolvedValue1 === resolvedValue2;
      case 'notEqual':
        return resolvedValue1 !== resolvedValue2;
      case 'contains':
        return resolvedValue1.includes(resolvedValue2);
      case 'notContains':
        return !resolvedValue1.includes(resolvedValue2);
      case 'startsWith':
        return resolvedValue1.startsWith(resolvedValue2);
      case 'endsWith':
        return resolvedValue1.endsWith(resolvedValue2);
      case 'regex':
        try {
          const regex = new RegExp(resolvedValue2);
          return regex.test(resolvedValue1);
        } catch (error) {
          throw new Error(`Invalid regex pattern: ${resolvedValue2}`);
        }
      default:
        return false;
    }
  }

  private resolveValue(value: string, data: any): string {
    // Simple expression resolution - in real implementation this would be more sophisticated
    if (value.startsWith('{{') && value.endsWith('}}')) {
      const expression = value.slice(2, -2).trim();
      try {
        // Simple property access like {{json.propertyName}}
        if (expression.startsWith('json.')) {
          const propertyPath = expression.substring(5);
          return this.getNestedProperty(data, propertyPath) || '';
        }
        return value;
      } catch (error) {
        return value;
      }
    }
    return value;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
