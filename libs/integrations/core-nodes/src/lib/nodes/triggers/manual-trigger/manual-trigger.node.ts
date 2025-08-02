import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../../interfaces/node.interfaces';

@Injectable()
export class ManualTriggerNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.manualTrigger',
    displayName: 'Manual Trigger',
    name: 'manualTrigger',
    group: ['trigger'],
    version: 1,
    description: 'Triggers workflow execution manually',
    defaults: {
      name: 'Manual Trigger'
    },
    inputs: [],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Execution Data',
        name: 'executionData',
        type: 'json',
        default: '{}',
        description: 'Data to pass to the workflow when triggered manually'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const executionData = context.getNodeParameter('executionData', 0, '{}') as string;
    
    let data: any = {};
    try {
      data = JSON.parse(executionData);
    } catch (error) {
      context.logger.warn('Invalid JSON in execution data, using empty object');
    }
    
    const triggerData: INodeExecutionData = {
      json: {
        ...data,
        $trigger: {
          type: 'manual',
          timestamp: new Date().toISOString(),
          source: 'manual-execution'
        }
      }
    };
    
    context.logger.info('Manual trigger executed');
    return [[triggerData]];
  }
}
