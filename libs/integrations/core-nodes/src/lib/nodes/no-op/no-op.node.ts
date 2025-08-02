import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class NoOpNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.noOp',
    displayName: 'No Operation',
    name: 'noOp',
    group: ['transform'],
    version: 1,
    description: 'Does nothing - just passes data through unchanged',
    defaults: {
      name: 'No Operation'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: []
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    
    // Simply pass through all input data unchanged
    return [items];
  }
}
