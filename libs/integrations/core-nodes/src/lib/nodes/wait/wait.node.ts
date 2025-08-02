import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class WaitNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.wait',
    displayName: 'Wait',
    name: 'wait',
    group: ['transform'],
    version: 1,
    description: 'Waits for a certain amount of time before continuing',
    defaults: {
      name: 'Wait'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Resume',
        name: 'resume',
        type: 'options',
        options: [
          { name: 'After Time Interval', value: 'timeInterval' },
          { name: 'At Specific Time', value: 'specificTime' },
          { name: 'On Webhook Call', value: 'webhook' },
          { name: 'On Form Submission', value: 'form' }
        ],
        default: 'timeInterval',
        description: 'Determines when the workflow should continue'
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'number',
        displayOptions: {
          show: {
            resume: ['timeInterval']
          }
        },
        default: 1,
        description: 'The amount of time to wait'
      },
      {
        displayName: 'Unit',
        name: 'unit',
        type: 'options',
        displayOptions: {
          show: {
            resume: ['timeInterval']
          }
        },
        options: [
          { name: 'Seconds', value: 'seconds' },
          { name: 'Minutes', value: 'minutes' },
          { name: 'Hours', value: 'hours' },
          { name: 'Days', value: 'days' }
        ],
        default: 'seconds',
        description: 'The unit of time'
      },
      {
        displayName: 'Date and Time',
        name: 'dateTime',
        type: 'dateTime',
        displayOptions: {
          show: {
            resume: ['specificTime']
          }
        },
        default: '',
        description: 'The date and time when execution should resume'
      },
      {
        displayName: 'Webhook URL',
        name: 'webhookUrl',
        type: 'string',
        displayOptions: {
          show: {
            resume: ['webhook']
          }
        },
        default: '',
        description: 'The webhook URL that will resume execution'
      },
      {
        displayName: 'Form Fields',
        name: 'formFields',
        type: 'fixedCollection',
        displayOptions: {
          show: {
            resume: ['form']
          }
        },
        default: { values: [] },
        options: [
          {
            name: 'values',
            value: [
              {
                displayName: 'Field Name',
                name: 'fieldName',
                type: 'string',
                default: '',
                description: 'Name of the form field'
              },
              {
                displayName: 'Field Type',
                name: 'fieldType',
                type: 'options',
                options: [
                  { name: 'Text', value: 'text' },
                  { name: 'Number', value: 'number' },
                  { name: 'Email', value: 'email' },
                  { name: 'Password', value: 'password' },
                  { name: 'Textarea', value: 'textarea' },
                  { name: 'Select', value: 'select' },
                  { name: 'Checkbox', value: 'checkbox' }
                ],
                default: 'text',
                description: 'Type of the form field'
              },
              {
                displayName: 'Field Label',
                name: 'fieldLabel',
                type: 'string',
                default: '',
                description: 'Label for the form field'
              },
              {
                displayName: 'Required',
                name: 'required',
                type: 'boolean',
                default: false,
                description: 'Whether the field is required'
              }
            ]
          }
        ]
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        default: {},
        description: 'Additional options',
        options: [
          {
            displayName: 'Ignore Bots',
            name: 'ignoreBots',
            type: 'boolean',
            default: true,
            description: 'Whether to ignore bot requests for webhooks'
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 1,
            description: 'Maximum number of times the wait can be resumed'
          }
        ]
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const resume = context.getNodeParameter('resume', 0, 'timeInterval') as string;
    const options = context.getNodeParameter('options', 0, {}) as any;

    switch (resume) {
      case 'timeInterval':
        return this.executeTimeInterval(context, items);
      
      case 'specificTime':
        return this.executeSpecificTime(context, items);
      
      case 'webhook':
        return this.executeWebhook(context, items);
      
      case 'form':
        return this.executeForm(context, items);
      
      default:
        return [items];
    }
  }

  private async executeTimeInterval(context: NodeExecuteContext, items: INodeExecutionData[]): Promise<INodeExecutionData[][]> {
    const amount = context.getNodeParameter('amount', 0, 1) as number;
    const unit = context.getNodeParameter('unit', 0, 'seconds') as string;
    
    // Convert to milliseconds
    let waitTime = amount;
    switch (unit) {
      case 'minutes':
        waitTime *= 60;
        break;
      case 'hours':
        waitTime *= 60 * 60;
        break;
      case 'days':
        waitTime *= 60 * 60 * 24;
        break;
    }
    waitTime *= 1000; // Convert to milliseconds
    
    context.logger.info(`Waiting for ${amount} ${unit}...`);
    
    // In a real implementation, this would schedule the continuation
    // For now, we'll use a simple setTimeout
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Add wait metadata to items
    const resultItems: INodeExecutionData[] = items.map(item => ({
      ...item,
      json: {
        ...item.json,
        $wait: {
          type: 'timeInterval',
          amount,
          unit,
          waitedMs: waitTime,
          resumedAt: new Date().toISOString()
        }
      }
    }));
    
    return [resultItems];
  }

  private async executeSpecificTime(context: NodeExecuteContext, items: INodeExecutionData[]): Promise<INodeExecutionData[][]> {
    const dateTime = context.getNodeParameter('dateTime', 0, '') as string;
    
    if (!dateTime) {
      throw new Error('Date and time must be specified');
    }
    
    const targetTime = new Date(dateTime);
    const currentTime = new Date();
    
    if (targetTime <= currentTime) {
      context.logger.warn('Target time is in the past, continuing immediately');
      return [items];
    }
    
    const waitTime = targetTime.getTime() - currentTime.getTime();
    context.logger.info(`Waiting until ${targetTime.toISOString()}...`);
    
    // In a real implementation, this would schedule the continuation
    await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000))); // Max 1 minute for demo
    
    const resultItems: INodeExecutionData[] = items.map(item => ({
      ...item,
      json: {
        ...item.json,
        $wait: {
          type: 'specificTime',
          targetTime: targetTime.toISOString(),
          resumedAt: new Date().toISOString()
        }
      }
    }));
    
    return [resultItems];
  }

  private async executeWebhook(context: NodeExecuteContext, items: INodeExecutionData[]): Promise<INodeExecutionData[][]> {
    const webhookUrl = context.getNodeParameter('webhookUrl', 0, '') as string;
    const options = context.getNodeParameter('options', 0, {}) as any;
    
    // In a real implementation, this would register a webhook and wait for it to be called
    context.logger.info(`Webhook wait registered. URL: ${webhookUrl || '[auto-generated]'}`);
    
    // For demo purposes, simulate webhook call after a short delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const resultItems: INodeExecutionData[] = items.map(item => ({
      ...item,
      json: {
        ...item.json,
        $wait: {
          type: 'webhook',
          webhookUrl: webhookUrl || '[auto-generated]',
          webhookData: {
            // Simulated webhook data
            message: 'Webhook received',
            timestamp: new Date().toISOString()
          },
          resumedAt: new Date().toISOString()
        }
      }
    }));
    
    return [resultItems];
  }

  private async executeForm(context: NodeExecuteContext, items: INodeExecutionData[]): Promise<INodeExecutionData[][]> {
    const formFields = context.getNodeParameter('formFields', 0, { values: [] }) as any;
    
    context.logger.info(`Form wait registered with ${formFields.values?.length || 0} fields`);
    
    // In a real implementation, this would generate and display a form, then wait for submission
    // For demo purposes, simulate form submission after a short delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate form submission data
    const formData: Record<string, any> = {};
    if (formFields.values) {
      for (const field of formFields.values) {
        switch (field.fieldType) {
          case 'text':
          case 'email':
            formData[field.fieldName] = `Sample ${field.fieldName}`;
            break;
          case 'number':
            formData[field.fieldName] = Math.floor(Math.random() * 100);
            break;
          case 'checkbox':
            formData[field.fieldName] = Math.random() > 0.5;
            break;
          default:
            formData[field.fieldName] = `Sample value for ${field.fieldName}`;
        }
      }
    }
    
    const resultItems: INodeExecutionData[] = items.map(item => ({
      ...item,
      json: {
        ...item.json,
        $wait: {
          type: 'form',
          formFields: formFields.values || [],
          formData,
          resumedAt: new Date().toISOString()
        }
      }
    }));
    
    return [resultItems];
  }
}
