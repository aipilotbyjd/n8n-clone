export class ExecutionId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ExecutionId cannot be empty');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: ExecutionId | string): boolean {
    if (typeof other === 'string') {
      return this._value === other;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static generate(): ExecutionId {
    return new ExecutionId(Math.random().toString(36).substr(2, 16));
  }

  static fromString(value: string): ExecutionId {
    return new ExecutionId(value);
  }
}
