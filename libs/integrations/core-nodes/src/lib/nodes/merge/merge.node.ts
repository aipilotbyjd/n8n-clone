import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class MergeNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.merge',
    displayName: 'Merge',
    name: 'merge',
    group: ['transform'],
    version: 1,
    description: 'Merges data from multiple streams',
    defaults: {
      name: 'Merge'
    },
    inputs: ['main', 'main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'options',
        options: [
          { name: 'Append', value: 'append' },
          { name: 'Pass-through', value: 'passThrough' },
          { name: 'Wait', value: 'wait' },
          { name: 'Multiplex', value: 'multiplex' },
          { name: 'Combine', value: 'combine' }
        ],
        default: 'append',
        description: 'How to merge the data'
      },
      {
        displayName: 'Join',
        name: 'join',
        type: 'options',
        displayOptions: {
          show: {
            mode: ['combine']
          }
        },
        options: [
          { name: 'Inner Join', value: 'inner' },
          { name: 'Left Join', value: 'left' },
          { name: 'Outer Join', value: 'outer' }
        ],
        default: 'inner',
        description: 'How to join the data when combining'
      },
      {
        displayName: 'Property Input 1',
        name: 'property1',
        type: 'string',
        displayOptions: {
          show: {
            mode: ['combine']
          }
        },
        default: 'id',
        description: 'The property to use for joining from input 1'
      },
      {
        displayName: 'Property Input 2',
        name: 'property2',
        type: 'string',
        displayOptions: {
          show: {
            mode: ['combine']
          }
        },
        default: 'id',
        description: 'The property to use for joining from input 2'
      },
      {
        displayName: 'Output Data',
        name: 'output',
        type: 'options',
        displayOptions: {
          show: {
            mode: ['combine']
          }
        },
        options: [
          { name: 'Both Inputs', value: 'both' },
          { name: 'Input 1', value: 'input1' },
          { name: 'Input 2', value: 'input2' }
        ],
        default: 'both',
        description: 'Which data to output'
      },
      {
        displayName: 'Include Unpaired Items',
        name: 'includeUnpaired',
        type: 'boolean',
        displayOptions: {
          show: {
            mode: ['combine'],
            join: ['outer']
          }
        },
        default: false,
        description: 'Whether to include items that could not be paired'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const mode = context.getNodeParameter('mode', 0, 'append') as string;
    
    const input1 = context.getInputData('0') || [];
    const input2 = context.getInputData('1') || [];

    switch (mode) {
      case 'append':
        return this.executeAppend(input1, input2);
      
      case 'passThrough':
        return this.executePassThrough(input1, input2);
      
      case 'wait':
        return this.executeWait(input1, input2);
      
      case 'multiplex':
        return this.executeMultiplex(input1, input2);
      
      case 'combine':
        return this.executeCombine(context, input1, input2);
      
      default:
        return [input1.concat(input2)];
    }
  }

  private executeAppend(input1: INodeExecutionData[], input2: INodeExecutionData[]): INodeExecutionData[][] {
    // Simply append input2 to input1
    return [input1.concat(input2)];
  }

  private executePassThrough(input1: INodeExecutionData[], input2: INodeExecutionData[]): INodeExecutionData[][] {
    // Pass through input1 and wait for input2
    if (input2.length > 0) {
      return [input1];
    }
    return [[]];
  }

  private executeWait(input1: INodeExecutionData[], input2: INodeExecutionData[]): INodeExecutionData[][] {
    // Wait for both inputs to have data
    if (input1.length > 0 && input2.length > 0) {
      return [input1.concat(input2)];
    }
    return [[]];
  }

  private executeMultiplex(input1: INodeExecutionData[], input2: INodeExecutionData[]): INodeExecutionData[][] {
    // Combine each item from input1 with each item from input2
    const result: INodeExecutionData[] = [];
    
    for (const item1 of input1) {
      for (const item2 of input2) {
        result.push({
          json: {
            ...item1.json,
            ...item2.json
          },
          binary: {
            ...item1.binary,
            ...item2.binary
          }
        });
      }
    }
    
    return [result];
  }

  private executeCombine(
    context: NodeExecuteContext,
    input1: INodeExecutionData[],
    input2: INodeExecutionData[]
  ): INodeExecutionData[][] {
    const join = context.getNodeParameter('join', 0, 'inner') as string;
    const property1 = context.getNodeParameter('property1', 0, 'id') as string;
    const property2 = context.getNodeParameter('property2', 0, 'id') as string;
    const output = context.getNodeParameter('output', 0, 'both') as string;
    const includeUnpaired = context.getNodeParameter('includeUnpaired', 0, false) as boolean;

    const result: INodeExecutionData[] = [];
    const matched = new Set<number>();

    // Create a map of input2 items by their join property
    const input2Map = new Map<any, INodeExecutionData[]>();
    input2.forEach((item, index) => {
      const key = item.json[property2];
      if (!input2Map.has(key)) {
        input2Map.set(key, []);
      }
      input2Map.get(key)!.push(item);
    });

    // Process input1 items
    input1.forEach((item1, index1) => {
      const key = item1.json[property1];
      const matchingItems = input2Map.get(key) || [];

      if (matchingItems.length > 0) {
        // Found matches
        matchingItems.forEach(item2 => {
          let outputData: any = {};
          
          switch (output) {
            case 'both':
              outputData = {
                ...item1.json,
                ...item2.json
              };
              break;
            case 'input1':
              outputData = item1.json;
              break;
            case 'input2':
              outputData = item2.json;
              break;
          }

          result.push({
            json: outputData,
            binary: {
              ...item1.binary,
              ...item2.binary
            }
          });
        });
        
        // Mark input2 items as matched
        matchingItems.forEach(item2 => {
          const index2 = input2.indexOf(item2);
          if (index2 !== -1) {
            matched.add(index2);
          }
        });
      } else if (join === 'left' || (join === 'outer' && includeUnpaired)) {
        // No match found, but include item1 for left join or outer join
        result.push({
          json: output === 'input2' ? {} : item1.json,
          binary: item1.binary
        });
      }
    });

    // For outer join, include unmatched items from input2
    if (join === 'outer' && includeUnpaired) {
      input2.forEach((item2, index2) => {
        if (!matched.has(index2)) {
          result.push({
            json: output === 'input1' ? {} : item2.json,
            binary: item2.binary
          });
        }
      });
    }

    return [result];
  }
}
