import { AggregateRoot } from '@n8n-clone/domain/core';

export interface NodeParameter {
  name: string;
  value: any;
  type: string;
}

export class Node extends AggregateRoot {
  private _type: string;
  private _name: string;
  private _parameters: NodeParameter[];
  private _position: { x: number; y: number };

  constructor(
    id: string,
    type: string,
    name: string,
    parameters: NodeParameter[] = [],
    position: { x: number; y: number } = { x: 0, y: 0 }
  ) {
    super(id);
    this._type = type;
    this._name = name;
    this._parameters = parameters;
    this._position = position;
  }

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get parameters(): NodeParameter[] {
    return [...this._parameters];
  }

  get position(): { x: number; y: number } {
    return { ...this._position };
  }

  updateParameter(name: string, value: any): void {
    const paramIndex = this._parameters.findIndex(p => p.name === name);
    if (paramIndex >= 0) {
      this._parameters[paramIndex].value = value;
    } else {
      this._parameters.push({ name, value, type: typeof value });
    }
    this.touch();
  }

  updatePosition(x: number, y: number): void {
    this._position = { x, y };
    this.touch();
  }

  rename(newName: string): void {
    this._name = newName;
    this.touch();
  }
}
