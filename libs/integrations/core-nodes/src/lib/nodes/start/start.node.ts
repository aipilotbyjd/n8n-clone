import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class StartNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.start',
    displayName: 'Start',
    name: 'start',
    group: ['input'],
    version: 1,
    description: 'Starts the workflow execution',
    defaults: {
      name: 'Start'
    },
    inputs: [],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Always Pass Data',
        name: 'alwaysOutputData',
        type: 'boolean',
        default: false,
        description: 'Whether to always pass data through this node'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const alwaysOutputData = context.getNodeParameter('alwaysOutputData', 0, false) as boolean;
    
    // Start node typically receives trigger data or empty data
    const inputData = context.getInputData();
    
    // If no input data and alwaysOutputData is true, create empty object
    if (inputData.length === 0 && alwaysOutputData) {
      return [[{ json: {} }]];
    }
    
    // Pass through input data or create empty dataset
    return [inputData.length > 0 ? inputData : [{ json: {} }]];
  }
}
