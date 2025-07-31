import { v4 as uuidv4 } from 'uuid';

export class NodeId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('NodeId cannot be empty');
    }

    // For nodes, we can accept both UUIDs and custom string IDs (like n8n does)
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: NodeId | string): boolean {
    if (typeof other === 'string') {
      return this._value === other;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Static factory methods
  static generate(): NodeId {
    return new NodeId(uuidv4());
  }

  static fromString(value: string): NodeId {
    return new NodeId(value);
  }

  static generateReadable(prefix: string = 'node'): NodeId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return new NodeId(`${prefix}_${timestamp}_${random}`);
  }
}
