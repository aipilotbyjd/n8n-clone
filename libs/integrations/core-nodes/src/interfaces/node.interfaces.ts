export interface NodeDefinition {
  type: string;
  displayName: string;
  name: string;
  group: string[];
  version: number;
  description: string;
  defaults: {
    name: string;
  };
  inputs: string[];
  outputs: string[];
  properties: NodeProperty[];
  credentials?: CredentialInfo[];
}

export interface NodeProperty {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'collection' | 'fixedCollection' | 'json' | 'dateTime';
  default?: any;
  required?: boolean;
  description?: string;
  options?: { name: string; value: any }[] | NodeProperty[];
  displayOptions?: {
    show?: Record<string, any[]>;
    hide?: Record<string, any[]>;
  };
  typeOptions?: {
    multipleValues?: boolean;
    password?: boolean;
    rows?: number;
  };
}

export interface CredentialInfo {
  name: string;
  required?: boolean;
}

export interface INodeExecutionData {
  json: { [key: string]: any };
  binary?: { [key: string]: any };
  pairedItem?: {
    item: number;
    input?: number;
  } | {
    item: number;
    input?: number;
  }[];
}

export interface NodeExecuteContext {
  getInputData(inputName?: string): INodeExecutionData[];
  getNodeParameter(parameterName: string, itemIndex: number, defaultValue?: any): any;
  prepareOutputData(outputData: INodeExecutionData[]): INodeExecutionData[][];
  getCredentials(type: string): Promise<{ [key: string]: any }>;
  getWorkflowStaticData(type: string): any;
  helpers: NodeHelpers;
  logger: {
    debug(message: string, extra?: any): void;
    info(message: string, extra?: any): void;
    warn(message: string, extra?: any): void;
    error(message: string, extra?: any): void;
  };
}

export interface NodeHelpers {
  httpRequest(options: HttpRequestOptions): Promise<any>;
  httpRequestWithAuthentication(credentialsType: string, options: HttpRequestOptions): Promise<any>;
  returnJsonArray(jsonData: any[]): INodeExecutionData[];
  constructExecutionMetaData(inputData: INodeExecutionData[], options: { itemData: any }): INodeExecutionData[];
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  json?: boolean;
  timeout?: number;
  resolveWithFullResponse?: boolean;
  simple?: boolean;
  qs?: Record<string, any>;
}

export interface INodeType {
  description: NodeDefinition;
  execute(context: NodeExecuteContext): Promise<INodeExecutionData[][]>;
}

export interface INodeTypeDescription extends NodeDefinition {
  subtitle?: string;
  icon?: string;
  iconUrl?: string;
}
