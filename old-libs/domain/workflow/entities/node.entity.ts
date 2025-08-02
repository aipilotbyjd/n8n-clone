import { NodeId } from '../value-objects/node-id.vo';
import { NodePosition } from '../value-objects/node-position.vo';
import { NodeType, NodeParameters } from '@n8n-clone/shared';

export class Node {
  constructor(
    private readonly _id: NodeId,
    private _name: string,
    private readonly _type: NodeType,
    private _position: NodePosition,
    private _parameters: NodeParameters = {},
    private _disabled: boolean = false,
    private _notes: string = '',
    private _webhookId?: string,
    private _continueOnFail: boolean = false,
    private _alwaysOutputData: boolean = false,
    private _executeOnce: boolean = false,
    private _retryOnFail: boolean = false,
    private _maxTries: number = 3,
    private _waitBetweenTries: number = 1000
  ) {}

  // Getters
  get id(): NodeId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get type(): NodeType {
    return this._type;
  }

  get position(): NodePosition {
    return this._position;
  }

  get parameters(): NodeParameters {
    return { ...this._parameters };
  }

  get disabled(): boolean {
    return this._disabled;
  }

  get notes(): string {
    return this._notes;
  }

  get webhookId(): string | undefined {
    return this._webhookId;
  }

  get continueOnFail(): boolean {
    return this._continueOnFail;
  }

  get alwaysOutputData(): boolean {
    return this._alwaysOutputData;
  }

  get executeOnce(): boolean {
    return this._executeOnce;
  }

  get retryOnFail(): boolean {
    return this._retryOnFail;
  }

  get maxTries(): number {
    return this._maxTries;
  }

  get waitBetweenTries(): number {
    return this._waitBetweenTries;
  }

  // Business methods
  updateName(name: string): Node {
    if (!name || name.trim().length === 0) {
      throw new Error('Node name cannot be empty');
    }

    return new Node(
      this._id,
      name.trim(),
      this._type,
      this._position,
      this._parameters,
      this._disabled,
      this._notes,
      this._webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  updatePosition(position: NodePosition): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      position,
      this._parameters,
      this._disabled,
      this._notes,
      this._webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  updateParameters(parameters: NodeParameters): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      this._position,
      { ...parameters },
      this._disabled,
      this._notes,
      this._webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  setParameter(key: string, value: any): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      this._position,
      { ...this._parameters, [key]: value },
      this._disabled,
      this._notes,
      this._webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  disable(): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      this._position,
      this._parameters,
      true,
      this._notes,
      this._webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  enable(): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      this._position,
      this._parameters,
      false,
      this._notes,
      this._webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  updateNotes(notes: string): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      this._position,
      this._parameters,
      this._disabled,
      notes,
      this._webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  setWebhookId(webhookId: string): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      this._position,
      this._parameters,
      this._disabled,
      this._notes,
      webhookId,
      this._continueOnFail,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  enableContinueOnFail(): Node {
    return new Node(
      this._id,
      this._name,
      this._type,
      this._position,
      this._parameters,
      this._disabled,
      this._notes,
      this._webhookId,
      true,
      this._alwaysOutputData,
      this._executeOnce,
      this._retryOnFail,
      this._maxTries,
      this._waitBetweenTries
    );
  }

  isStartNode(): boolean {
    return this._type === NodeType.TRIGGER || this._type === NodeType.WEBHOOK;
  }

  isEndNode(): boolean {
    // A node is considered an end node if it has no outputs or is specifically marked as such
    return this._type === NodeType.SET && !this._alwaysOutputData;
  }

  canExecute(): boolean {
    return !this._disabled;
  }

  requiresWebhook(): boolean {
    return this._type === NodeType.WEBHOOK;
  }
}
