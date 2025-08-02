import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class StopAndErrorNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.stopAndError',
    displayName: 'Stop and Error',
    name: 'stopAndError',
    group: ['transform'],
    version: 1,
    description: 'Stops execution with an error message',
    defaults: {
      name: 'Stop and Error'
    },
    inputs: ['main'],
    outputs: [],
    properties: [
      {
        displayName: 'Error Message',
        name: 'errorMessage',
        type: 'string',
        default: 'Execution stopped by Stop and Error Node',
        description: 'Error message to display'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<never> {
    const errorMessage = context.getNodeParameter('errorMessage', 0) as string;
    throw new Error(errorMessage);
  }
}
