import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class SetNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.set',
    displayName: 'Set',
    name: 'set',
    group: ['transform'],
    version: 1,
    description: 'Sets a value',
    defaults: {
      name: 'Set'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Keep Only Set',
        name: 'keepOnlySet',
        type: 'boolean',
        default: false,
        description: 'Whether to keep only the set values and remove all others'
      },
      {
        displayName: 'Values to Set',
        name: 'values',
        type: 'fixedCollection',
        default: {},
        description: 'The values to set',
        options: [
          {
            name: 'boolean',
            value: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: 'propertyName',
                description: 'Name of the property to write data to'
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'boolean',
                default: false,
                description: 'The boolean value to set'
              }
            ]
          },
          {
            name: 'number',
            value: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: 'propertyName',
                description: 'Name of the property to write data to'
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'number',
                default: 0,
                description: 'The number value to set'
              }
            ]
          },
          {
            name: 'string',
            value: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: 'propertyName',
                description: 'Name of the property to write data to'
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'The string value to set'
              }
            ]
          }
        ]
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const keepOnlySet = context.getNodeParameter('keepOnlySet', itemIndex, false) as boolean;
      const values = context.getNodeParameter('values', itemIndex, {}) as any;

      let newItem: INodeExecutionData;
      
      if (keepOnlySet) {
        // Create new item with only set values
        newItem = {
          json: {},
          binary: items[itemIndex].binary,
          pairedItem: items[itemIndex].pairedItem
        };
      } else {
        // Copy existing item and add/modify values
        newItem = {
          json: { ...items[itemIndex].json },
          binary: items[itemIndex].binary,
          pairedItem: items[itemIndex].pairedItem
        };
      }

      // Set boolean values
      if (values.boolean) {
        for (const setValue of values.boolean) {
          newItem.json[setValue.name] = setValue.value;
        }
      }

      // Set number values
      if (values.number) {
        for (const setValue of values.number) {
          newItem.json[setValue.name] = setValue.value;
        }
      }

      // Set string values
      if (values.string) {
        for (const setValue of values.string) {
          newItem.json[setValue.name] = setValue.value;
        }
      }

      returnData.push(newItem);
    }

    return [returnData];
  }
}
