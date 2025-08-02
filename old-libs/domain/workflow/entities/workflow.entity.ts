import { WorkflowId } from '../value-objects/workflow-id.vo';
import { Node } from './node.entity';
import { Connection } from './connection.entity';
import { WorkflowSettings } from '../value-objects/workflow-settings.vo';
import { WorkflowValidator } from '../services/workflow-validator.service';
import { ValidationResult } from '@n8n-clone/shared';

export class Workflow {
  constructor(
    private readonly _id: WorkflowId,
    private _name: string,
    private _description: string,
    private _nodes: Node[],
    private _connections: Connection[],
    private _settings: WorkflowSettings,
    private _version: number = 1,
    private _active: boolean = false,
    private _tags: string[] = [],
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private readonly _createdBy: string
  ) {}

  // Getters
  get id(): WorkflowId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get nodes(): Node[] {
    return [...this._nodes];
  }

  get connections(): Connection[] {
    return [...this._connections];
  }

  get settings(): WorkflowSettings {
    return this._settings;
  }

  get version(): number {
    return this._version;
  }

  get active(): boolean {
    return this._active;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  // Business methods
  addNode(node: Node): Workflow {
    if (this._nodes.some(n => n.id.equals(node.id))) {
      throw new Error(`Node with id ${node.id.value} already exists`);
    }

    return new Workflow(
      this._id,
      this._name,
      this._description,
      [...this._nodes, node],
      this._connections,
      this._settings,
      this._version,
      this._active,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }

  removeNode(nodeId: string): Workflow {
    const filteredNodes = this._nodes.filter(n => !n.id.equals(nodeId));
    const filteredConnections = this._connections.filter(
      c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );

    return new Workflow(
      this._id,
      this._name,
      this._description,
      filteredNodes,
      filteredConnections,
      this._settings,
      this._version,
      this._active,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }

  addConnection(connection: Connection): Workflow {
    // Validate that both nodes exist
    const sourceExists = this._nodes.some(n => n.id.value === connection.sourceNodeId);
    const targetExists = this._nodes.some(n => n.id.value === connection.targetNodeId);

    if (!sourceExists || !targetExists) {
      throw new Error('Cannot create connection: source or target node does not exist');
    }

    return new Workflow(
      this._id,
      this._name,
      this._description,
      this._nodes,
      [...this._connections, connection],
      this._settings,
      this._version,
      this._active,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }

  updateName(name: string): Workflow {
    if (!name || name.trim().length === 0) {
      throw new Error('Workflow name cannot be empty');
    }

    return new Workflow(
      this._id,
      name.trim(),
      this._description,
      this._nodes,
      this._connections,
      this._settings,
      this._version,
      this._active,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }

  updateDescription(description: string): Workflow {
    return new Workflow(
      this._id,
      this._name,
      description,
      this._nodes,
      this._connections,
      this._settings,
      this._version,
      this._active,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }

  activate(): Workflow {
    const validationResult = this.validate();
    if (!validationResult.isValid) {
      throw new Error(`Cannot activate workflow: ${validationResult.errors.join(', ')}`);
    }

    return new Workflow(
      this._id,
      this._name,
      this._description,
      this._nodes,
      this._connections,
      this._settings,
      this._version,
      true,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }

  deactivate(): Workflow {
    return new Workflow(
      this._id,
      this._name,
      this._description,
      this._nodes,
      this._connections,
      this._settings,
      this._version,
      false,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }

  validate(): ValidationResult {
    return WorkflowValidator.validate(this);
  }

  incrementVersion(): Workflow {
    return new Workflow(
      this._id,
      this._name,
      this._description,
      this._nodes,
      this._connections,
      this._settings,
      this._version + 1,
      this._active,
      this._tags,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }
}
