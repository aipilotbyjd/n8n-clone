import { AggregateRoot } from '@n8n-clone/domain/core';

export class Variable extends AggregateRoot {
  private _name: string;
  private _value: string;
  private _type: string;
  private _scope: string;
  private _isProtected: boolean;

  constructor(
    id: string,
    name: string,
    value: string,
    type: string,
    scope: string,
    isProtected: boolean = false,
  ) {
    super(id);
    this._name = name;
    this._value = value;
    this._type = type;
    this._scope = scope;
    this._isProtected = isProtected;
    this.validateInvariants();
  }

  get name(): string {
    return this._name;
  }

  get value(): string {
    return this._value;
  }

  get type(): string {
    return this._type;
  }

  get scope(): string {
    return this._scope;
  }

  get isProtected(): boolean {
    return this._isProtected;
  }

  updateValue(newValue: string): void {
    if (this._isProtected) {
      throw new Error('Cannot update the value of a protected variable');
    }
    this._value = newValue;
    this.touch();
  }

  updateScope(newScope: string): void {
    this._scope = newScope;
    this.touch();
  }

  protect(): void {
    this._isProtected = true;
    this.touch();
  }

  unprotect(): void {
    this._isProtected = false;
    this.touch();
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Variable name cannot be empty');
    }
    this._name = newName;
    this.touch();
  }

  private validateInvariants(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Variable name is required');
    }

    if (this._name.length > 100) {
      throw new Error('Variable name cannot exceed 100 characters');
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      value: this._value,
      type: this._type,
      scope: this._scope,
      isProtected: this._isProtected,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
