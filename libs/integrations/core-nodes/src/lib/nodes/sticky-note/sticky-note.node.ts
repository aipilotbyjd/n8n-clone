import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class StickyNoteNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.stickyNote',
    displayName: 'Sticky Note',
    name: 'stickyNote',
    group: ['input'],
    version: 1,
    description: 'Adds documentation notes to workflows - does not process data',
    defaults: {
      name: 'Sticky Note'
    },
    inputs: [],
    outputs: [],
    properties: [
      {
        displayName: 'Note Content',
        name: 'content',
        type: 'string',
        typeOptions: {
          rows: 5
        },
        default: 'Add your notes here...',
        description: 'The content of the sticky note'
      },
      {
        displayName: 'Note Color',
        name: 'color',
        type: 'options',
        options: [
          { name: 'Yellow', value: 'yellow' },
          { name: 'Blue', value: 'blue' },
          { name: 'Green', value: 'green' },
          { name: 'Pink', value: 'pink' },
          { name: 'Orange', value: 'orange' },
          { name: 'Purple', value: 'purple' },
          { name: 'Gray', value: 'gray' }
        ],
        default: 'yellow',
        description: 'The color of the sticky note'
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'options',
        options: [
          { name: 'Small', value: 'small' },
          { name: 'Medium', value: 'medium' },
          { name: 'Large', value: 'large' }
        ],
        default: 'medium',
        description: 'The size of the sticky note'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    // Sticky notes don't process data - they're just for documentation
    // In a real implementation, this node wouldn't actually execute
    // but would be handled specially by the workflow editor
    
    const content = context.getNodeParameter('content', 0) as string;
    const color = context.getNodeParameter('color', 0) as string;
    const size = context.getNodeParameter('size', 0) as string;
    
    context.logger.info(`Sticky Note: ${content}`);
    
    // Return empty array since sticky notes don't output data
    return [[]];
  }
}
