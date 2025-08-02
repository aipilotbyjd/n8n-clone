import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class SplitInBatchesNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.splitInBatches',
    displayName: 'Split In Batches',
    name: 'splitInBatches',
    group: ['transform'],
    version: 1,
    description: 'Splits data into smaller batches for processing',
    defaults: {
      name: 'Split In Batches'
    },
    inputs: ['main'],
    outputs: ['main', 'main'], // First output: batches, Second output: completion
    properties: [
      {
        displayName: 'Batch Size',
        name: 'batchSize',
        type: 'number',
        default: 10,
        required: true,
        description: 'The number of items to process in each batch'
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        default: {},
        description: 'Additional options',
        options: [
          {
            displayName: 'Reset',
            name: 'reset',
            type: 'boolean',
            default: false,
            description: 'Resets the node and restarts from the first batch'
          }
        ]
      }
    ]
  };

  private static batches = new Map<string, {
    items: INodeExecutionData[];
    currentBatch: number;
    totalBatches: number;
    processingComplete: boolean;
  }>();

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const batchSize = context.getNodeParameter('batchSize', 0, 10) as number;
    const options = context.getNodeParameter('options', 0, {}) as any;
    
    // Generate unique key for this execution context
    const contextKey = this.generateContextKey(context);
    
    // Check if reset is requested
    if (options.reset) {
      SplitInBatchesNode.batches.delete(contextKey);
    }
    
    // Initialize or get existing batch state
    let batchState = SplitInBatchesNode.batches.get(contextKey);
    
    if (!batchState) {
      // First execution - initialize batches
      const totalBatches = Math.ceil(items.length / batchSize);
      batchState = {
        items: [...items], // Copy items
        currentBatch: 0,
        totalBatches,
        processingComplete: false
      };
      SplitInBatchesNode.batches.set(contextKey, batchState);
    }
    
    // Check if processing is complete
    if (batchState.processingComplete || batchState.currentBatch >= batchState.totalBatches) {
      // All batches processed - send completion signal
      SplitInBatchesNode.batches.delete(contextKey);
      return [[], [{ json: { batchProcessingComplete: true, totalBatches: batchState.totalBatches } }]];
    }
    
    // Get current batch
    const startIndex = batchState.currentBatch * batchSize;
    const endIndex = Math.min(startIndex + batchSize, batchState.items.length);
    const currentBatchItems = batchState.items.slice(startIndex, endIndex);
    
    // Add batch metadata to each item
    const batchItems: INodeExecutionData[] = currentBatchItems.map((item, index) => ({
      ...item,
      json: {
        ...item.json,
        $batch: {
          current: batchState!.currentBatch + 1,
          total: batchState!.totalBatches,
          itemIndex: startIndex + index,
          isLast: batchState!.currentBatch + 1 === batchState!.totalBatches
        }
      }
    }));
    
    // Move to next batch
    batchState.currentBatch++;
    
    // Check if this was the last batch
    if (batchState.currentBatch >= batchState.totalBatches) {
      batchState.processingComplete = true;
    }
    
    return [batchItems, []];
  }

  private generateContextKey(context: NodeExecuteContext): string {
    // In a real implementation, this would use execution context identifiers
    // For now, we'll use a simple approach
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
