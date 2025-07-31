export class Connection {
  constructor(
    public readonly sourceNodeId: string,
    public readonly targetNodeId: string,
    public readonly sourceOutput: string = 'main',
    public readonly targetInput: string = 'main',
    public readonly type: 'main' | 'ai' = 'main'
  ) {
    if (!sourceNodeId || !targetNodeId) {
      throw new Error('Source and target node IDs are required for connection');
    }

    if (sourceNodeId === targetNodeId) {
      throw new Error('Cannot create connection from node to itself');
    }
  }

  // Business methods
  equals(other: Connection): boolean {
    return (
      this.sourceNodeId === other.sourceNodeId &&
      this.targetNodeId === other.targetNodeId &&
      this.sourceOutput === other.sourceOutput &&
      this.targetInput === other.targetInput &&
      this.type === other.type
    );
  }

  isMainConnection(): boolean {
    return this.type === 'main';
  }

  isAiConnection(): boolean {
    return this.type === 'ai';
  }

  toString(): string {
    return `${this.sourceNodeId}[${this.sourceOutput}] -> ${this.targetNodeId}[${this.targetInput}]`;
  }

  // Static factory methods
  static createMainConnection(sourceNodeId: string, targetNodeId: string): Connection {
    return new Connection(sourceNodeId, targetNodeId, 'main', 'main', 'main');
  }

  static createAiConnection(sourceNodeId: string, targetNodeId: string): Connection {
    return new Connection(sourceNodeId, targetNodeId, 'ai', 'ai', 'ai');
  }

  static createCustomConnection(
    sourceNodeId: string,
    targetNodeId: string,
    sourceOutput: string,
    targetInput: string,
    type: 'main' | 'ai' = 'main'
  ): Connection {
    return new Connection(sourceNodeId, targetNodeId, sourceOutput, targetInput, type);
  }
}
