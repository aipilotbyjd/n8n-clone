import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class FunctionNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.function',
    displayName: 'Function',
    name: 'function',
    group: ['transform'],
    version: 1,
    description: 'Executes JavaScript code',
    defaults: {
      name: 'Function'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Function Code',
        name: 'functionCode',
        type: 'string',
        default: '// Your code here',
        description: 'JavaScript code to execute'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    const functionCode = context.getNodeParameter('functionCode', 0, '// Your code here') as string;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      try {
         
        eval(functionCode);
        returnData.push(item);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        returnData.push({
          json: {
            error: {
              message: errorMessage,
              stack: errorStack
            }
          },
          pairedItem: { item: itemIndex }
        });
      }
    }

    return [returnData];
  }
}
