import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class CodeNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.code',
    displayName: 'Code',
    name: 'code',
    group: ['transform'],
    version: 1,
    description: 'Executes JavaScript or Python code',
    defaults: {
      name: 'Code'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Language',
        name: 'language',
        type: 'options',
        options: [
          { name: 'JavaScript', value: 'javascript' },
          { name: 'Python', value: 'python' }
        ],
        default: 'javascript',
        description: 'The programming language to use'
      },
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'options',
        options: [
          { name: 'Run Once for All Items', value: 'runOnceForAllItems' },
          { name: 'Run Once for Each Item', value: 'runOnceForEachItem' }
        ],
        default: 'runOnceForEachItem',
        description: 'Whether to run the code once for all items or once for each item'
      },
      {
        displayName: 'JavaScript Code',
        name: 'jsCode',
        type: 'string',
        typeOptions: {
          rows: 10
        },
        displayOptions: {
          show: {
            language: ['javascript']
          }
        },
        default: `// Loop over input items and add a new field called 'myNewField' to the JSON of each one
for (const item of $input.all()) {
  item.json.myNewField = 'Hello World!';
}

return $input.all();`,
        description: 'JavaScript code to execute'
      },
      {
        displayName: 'Python Code',
        name: 'pythonCode',
        type: 'string',
        typeOptions: {
          rows: 10
        },
        displayOptions: {
          show: {
            language: ['python']
          }
        },
        default: `# Loop over input items and add a new field called 'myNewField' to the JSON of each one
items = _input.all()
for item in items:
    item['json']['myNewField'] = 'Hello World!'

return items`,
        description: 'Python code to execute'
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const language = context.getNodeParameter('language', 0, 'javascript') as string;
    const mode = context.getNodeParameter('mode', 0, 'runOnceForEachItem') as string;

    if (language === 'javascript') {
      const jsCode = context.getNodeParameter('jsCode', 0) as string;
      return this.executeJavaScript(context, items, jsCode, mode);
    } else if (language === 'python') {
      const pythonCode = context.getNodeParameter('pythonCode', 0) as string;
      return this.executePython(context, items, pythonCode, mode);
    }

    return [items];
  }

  private async executeJavaScript(
    context: NodeExecuteContext,
    items: INodeExecutionData[],
    code: string,
    mode: string
  ): Promise<INodeExecutionData[][]> {
    try {
      // Create sandbox environment
      const sandbox = {
        $input: {
          all: () => items,
          first: () => items[0] || null,
          last: () => items[items.length - 1] || null,
          item: (index: number) => items[index] || null
        },
        $json: items.map(item => item.json),
        $binary: items.map(item => item.binary || {}),
        $itemIndex: 0,
        $node: {
          name: context.getNodeParameter('name', 0, 'Code'),
          id: 'code-node'
        },
        $now: new Date(),
        $today: new Date().toISOString().split('T')[0],
        $workflow: {
          id: 'workflow-id',
          name: 'Workflow'
        },
        console: {
          log: (...args: any[]) => context.logger.info(args.join(' ')),
          error: (...args: any[]) => context.logger.error(args.join(' ')),
          warn: (...args: any[]) => context.logger.warn(args.join(' '))
        }
      };

      if (mode === 'runOnceForAllItems') {
        // Execute code once for all items
        const func = new Function(
          '$input', '$json', '$binary', '$node', '$now', '$today', '$workflow', 'console',
          code
        );
        
        const result = func(
          sandbox.$input,
          sandbox.$json,
          sandbox.$binary,
          sandbox.$node,
          sandbox.$now,
          sandbox.$today,
          sandbox.$workflow,
          sandbox.console
        );

        return [Array.isArray(result) ? result : [result]];
      } else {
        // Execute code once for each item
        const returnData: INodeExecutionData[] = [];

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
          sandbox.$itemIndex = itemIndex;
          
          const func = new Function(
            '$input', '$json', '$binary', '$itemIndex', '$node', '$now', '$today', '$workflow', 'console',
            code
          );
          
          const result = func(
            sandbox.$input,
            items[itemIndex].json,
            items[itemIndex].binary,
            itemIndex,
            sandbox.$node,
            sandbox.$now,
            sandbox.$today,
            sandbox.$workflow,
            sandbox.console
          );

          if (result) {
            returnData.push(typeof result === 'object' && result.json ? result : { json: result });
          }
        }

        return [returnData];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      context.logger.error(`Code execution failed: ${errorMessage}`);
      return [[{
        json: {
          error: {
            message: errorMessage,
            stack: errorStack
          }
        }
      }]];
    }
  }

  private async executePython(
    context: NodeExecuteContext,
    items: INodeExecutionData[],
    code: string,
    mode: string
  ): Promise<INodeExecutionData[][]> {
    // Python execution would require a Python runtime
    // For now, return an error indicating Python is not supported
    context.logger.error('Python execution is not yet implemented');
    return [[{
      json: {
        error: {
          message: 'Python execution is not yet implemented',
          code: 'PYTHON_NOT_SUPPORTED'
        }
      }
    }]];
  }
}
