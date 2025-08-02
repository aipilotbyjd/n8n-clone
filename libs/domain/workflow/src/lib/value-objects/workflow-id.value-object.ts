export class WorkflowId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('WorkflowId cannot be empty');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: WorkflowId | string): boolean {
    if (typeof other === 'string') {
      return this._value === other;
    }
    return this._value === other._value;
  }

  static fromString(value: string): WorkflowId {
    return new WorkflowId(value);
  }

  static generate(): WorkflowId {
    return new WorkflowId(Math.random().toString(36).substr(2, 16));
  }
}
