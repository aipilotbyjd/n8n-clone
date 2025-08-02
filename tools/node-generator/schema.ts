export interface NodeSchema {
  name: string;
  displayName?: string;
  description?: string;
  category?: 'core' | 'trigger' | 'http' | 'database' | 'social' | 'productivity' | 'finance';
  version?: number;
  inputs?: number;
  outputs?: number;
  credentials?: string[];
  properties?: NodeProperty[];
}
