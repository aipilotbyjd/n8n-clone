import { Injectable } from '@nestjs/common';
import { INodeType, NodeDefinition, INodeExecutionData, NodeExecuteContext } from '../../../interfaces/node.interfaces';

@Injectable()
export class HttpRequestNode implements INodeType {
  description: NodeDefinition = {
    type: 'n8n-nodes-base.httpRequest',
    displayName: 'HTTP Request',
    name: 'httpRequest',
    group: ['output'],
    version: 1,
    description: 'Makes an HTTP request and returns the response data',
    defaults: {
      name: 'HTTP Request'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        options: [
          { name: 'DELETE', value: 'DELETE' },
          { name: 'GET', value: 'GET' },
          { name: 'HEAD', value: 'HEAD' },
          { name: 'OPTIONS', value: 'OPTIONS' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' }
        ],
        default: 'GET',
        description: 'The request method to use'
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        required: true,
        description: 'The URL to make the request to'
      },
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'options',
        options: [
          { name: 'None', value: 'none' },
          { name: 'Basic Auth', value: 'basicAuth' },
          { name: 'Header Auth', value: 'headerAuth' },
          { name: 'OAuth1', value: 'oAuth1' },
          { name: 'OAuth2', value: 'oAuth2' }
        ],
        default: 'none',
        description: 'The authentication method to use'
      },
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            authentication: ['basicAuth']
          }
        },
        description: 'Username for basic authentication'
      },
      {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        typeOptions: {
          password: true
        },
        default: '',
        displayOptions: {
          show: {
            authentication: ['basicAuth']
          }
        },
        description: 'Password for basic authentication'
      },
      {
        displayName: 'Send Headers',
        name: 'sendHeaders',
        type: 'boolean',
        default: false,
        description: 'Whether to send custom headers'
      },
      {
        displayName: 'Headers',
        name: 'headerParameters',
        type: 'fixedCollection',
        displayOptions: {
          show: {
            sendHeaders: [true]
          }
        },
        default: {},
        options: [
          {
            name: 'parameter',
            value: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the header'
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Value of the header'
              }
            ]
          }
        ]
      },
      {
        displayName: 'Send Body',
        name: 'sendBody',
        type: 'boolean',
        default: false,
        displayOptions: {
          hide: {
            method: ['GET', 'HEAD', 'DELETE']
          }
        },
        description: 'Whether to send a body with the request'
      },
      {
        displayName: 'Body Content Type',
        name: 'contentType',
        type: 'options',
        displayOptions: {
          show: {
            sendBody: [true]
          }
        },
        options: [
          { name: 'JSON', value: 'json' },
          { name: 'Form-Data Multipart', value: 'multipart-form-data' },
          { name: 'Form Encoded', value: 'form-urlencoded' },
          { name: 'Raw/Custom', value: 'raw' }
        ],
        default: 'json',
        description: 'Content-Type to use to send body'
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'json',
        displayOptions: {
          show: {
            sendBody: [true],
            contentType: ['json', 'raw']
          }
        },
        default: '{}',
        description: 'Data to send as body'
      },
      {
        displayName: 'Response Format',
        name: 'responseFormat',
        type: 'options',
        options: [
          { name: 'Autodetect', value: 'autodetect' },
          { name: 'JSON', value: 'json' },
          { name: 'String', value: 'string' }
        ],
        default: 'autodetect',
        description: 'The format in which the response should be returned'
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        default: {},
        description: 'Additional options',
        options: [
          {
            displayName: 'Timeout',
            name: 'timeout',
            type: 'number',
            default: 10000,
            description: 'Time in ms to wait for the server to send response headers before aborting request'
          },
          {
            displayName: 'Redirect',
            name: 'redirect',
            type: 'options',
            options: [
              { name: 'Follow', value: 'follow' },
              { name: 'Error', value: 'error' },
              { name: 'Manual', value: 'manual' }
            ],
            default: 'follow',
            description: 'How to handle redirects'
          }
        ]
      }
    ]
  };

  async execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]> {
    const items = context.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const method = context.getNodeParameter('method', itemIndex, 'GET') as string;
        const url = context.getNodeParameter('url', itemIndex) as string;
        const authentication = context.getNodeParameter('authentication', itemIndex, 'none') as string;
        const sendHeaders = context.getNodeParameter('sendHeaders', itemIndex, false) as boolean;
        const sendBody = context.getNodeParameter('sendBody', itemIndex, false) as boolean;
        const contentType = context.getNodeParameter('contentType', itemIndex, 'json') as string;
        const responseFormat = context.getNodeParameter('responseFormat', itemIndex, 'autodetect') as string;
        const options = context.getNodeParameter('options', itemIndex, {}) as any;

        // Build request options
        const requestOptions: any = {
          method: method.toUpperCase(),
          url,
          json: responseFormat === 'json' || (responseFormat === 'autodetect' && contentType === 'json'),
          timeout: options.timeout || 10000,
          resolveWithFullResponse: true,
          simple: false
        };

        // Add headers
        if (sendHeaders) {
          const headerParameters = context.getNodeParameter('headerParameters', itemIndex, {}) as any;
          if (headerParameters.parameter) {
            requestOptions.headers = {};
            for (const header of headerParameters.parameter) {
              requestOptions.headers[header.name] = header.value;
            }
          }
        }

        // Add authentication
        if (authentication === 'basicAuth') {
          const username = context.getNodeParameter('username', itemIndex) as string;
          const password = context.getNodeParameter('password', itemIndex) as string;
          requestOptions.auth = { username, password };
        }

        // Add body for non-GET requests
        if (sendBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
          if (contentType === 'json') {
            const body = context.getNodeParameter('body', itemIndex, '{}') as string;
            try {
              requestOptions.body = JSON.parse(body);
              requestOptions.json = true;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              throw new Error(`Invalid JSON in body: ${errorMessage}`);
            }
          } else if (contentType === 'raw') {
            requestOptions.body = context.getNodeParameter('body', itemIndex, '') as string;
          }
        }

        // Make the HTTP request
        const response = await context.helpers.httpRequest(requestOptions);

        // Process response
        let responseData;
        if (responseFormat === 'json' || (responseFormat === 'autodetect' && response.headers['content-type']?.includes('application/json'))) {
          try {
            responseData = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
          } catch {
            responseData = response.body;
          }
        } else {
          responseData = response.body;
        }

        // Create result item
        const resultItem: INodeExecutionData = {
          json: {
            data: responseData,
            headers: response.headers,
            statusCode: response.statusCode,
            statusMessage: response.statusMessage
          },
          pairedItem: { item: itemIndex }
        };

        returnData.push(resultItem);

      } catch (error) {
        // Handle errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        const statusCode = (error as any)?.statusCode || null;
        const errorItem: INodeExecutionData = {
          json: {
            error: {
              message: errorMessage,
              stack: errorStack,
              statusCode: statusCode
            }
          },
          pairedItem: { item: itemIndex }
        };

        returnData.push(errorItem);
      }
    }

    return [returnData];
  }
}
