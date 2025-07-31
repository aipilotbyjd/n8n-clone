import { v4 as uuidv4 } from 'uuid';

export class WorkflowId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('WorkflowId cannot be empty');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('WorkflowId must be a valid UUID');
    }

    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: WorkflowId | string): boolean {
    if (typeof other === 'string') {
      return this._value === other;
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Static factory method
  static generate(): WorkflowId {
    return new WorkflowId(uuidv4());
  }

  static fromString(value: string): WorkflowId {
    return new WorkflowId(value);
  }
}
