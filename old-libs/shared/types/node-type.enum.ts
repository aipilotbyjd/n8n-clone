export enum NodeType {
  // Core nodes
  START = 'n8n-nodes-base.start',
  SET = 'n8n-nodes-base.set',
  IF = 'n8n-nodes-base.if',
  SWITCH = 'n8n-nodes-base.switch',
  MERGE = 'n8n-nodes-base.merge',
  CODE = 'n8n-nodes-base.code',
  FUNCTION = 'n8n-nodes-base.function',
  FUNCTION_ITEM = 'n8n-nodes-base.functionItem',
  
  // Trigger nodes
  TRIGGER = 'n8n-nodes-base.trigger',
  WEBHOOK = 'n8n-nodes-base.webhook',
  CRON = 'n8n-nodes-base.cron',
  INTERVAL = 'n8n-nodes-base.interval',
  MANUAL_TRIGGER = 'n8n-nodes-base.manualTrigger',
  
  // HTTP nodes
  HTTP_REQUEST = 'n8n-nodes-base.httpRequest',
  
  // Integration nodes (examples)
  GOOGLE_SHEETS = 'n8n-nodes-base.googleSheets',
  SLACK = 'n8n-nodes-base.slack',
  EMAIL = 'n8n-nodes-base.emailSend',
  GITHUB = 'n8n-nodes-base.github',
  NOTION = 'n8n-nodes-base.notion',
  AIRTABLE = 'n8n-nodes-base.airtable',
  
  // AI nodes
  OPENAI = 'n8n-nodes-base.openAi',
  
  // Database nodes
  MYSQL = 'n8n-nodes-base.mySql',
  POSTGRES = 'n8n-nodes-base.postgres',
  MONGODB = 'n8n-nodes-base.mongoDb',
  
  // File nodes
  READ_BINARY_FILE = 'n8n-nodes-base.readBinaryFile',
  WRITE_BINARY_FILE = 'n8n-nodes-base.writeBinaryFile',
  
  // Custom node type for extensibility
  CUSTOM = 'custom'
}

export const TRIGGER_NODE_TYPES = [
  NodeType.TRIGGER,
  NodeType.WEBHOOK,
  NodeType.CRON,
  NodeType.INTERVAL,
  NodeType.MANUAL_TRIGGER
];

export const CORE_NODE_TYPES = [
  NodeType.START,
  NodeType.SET,
  NodeType.IF,
  NodeType.SWITCH,
  NodeType.MERGE,
  NodeType.CODE,
  NodeType.FUNCTION,
  NodeType.FUNCTION_ITEM
];

export const isTriggerNode = (nodeType: NodeType): boolean => {
  return TRIGGER_NODE_TYPES.includes(nodeType);
};

export const isCoreNode = (nodeType: NodeType): boolean => {
  return CORE_NODE_TYPES.includes(nodeType);
};

export const getNodeCategory = (nodeType: NodeType): string => {
  if (isTriggerNode(nodeType)) return 'trigger';
  if (isCoreNode(nodeType)) return 'core';
  
  if (nodeType.includes('google')) return 'google';
  if (nodeType.includes('aws')) return 'aws';
  if (nodeType.includes('microsoft')) return 'microsoft';
  if (nodeType.includes('database') || 
      [NodeType.MYSQL, NodeType.POSTGRES, NodeType.MONGODB].includes(nodeType)) {
    return 'database';
  }
  
  return 'integration';
};
