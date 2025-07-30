// ========================================
// PHASE 2: CORE DOMAIN IMPLEMENTATION
// ========================================

// 1. Domain Entities Implementation
// libs/domain/workflow/entities/workflow.entity.ts
export class Workflow {
  constructor(
    private readonly _id: WorkflowId,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _nodes: Map<string, Node>,
    private readonly _connections: Connection[],
    private readonly _settings: WorkflowSettings,
    private readonly _tags: string[],
    private readonly _active: boolean,
    private readonly _version: number,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
    private readonly _createdBy: UserId
  ) {
    this.validateInvariants();
  }

  // Getters
  get id(): WorkflowId { return this._id; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get nodes(): Node[] { return Array.from(this._nodes.values()); }
  get connections(): Connection[] { return [...this._connections]; }
  get settings(): WorkflowSettings { return this._settings; }
  get tags(): string[] { return [...this._tags]; }
  get isActive(): boolean { return this._active; }
  get version(): number { return this._version; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get createdBy(): UserId { return this._createdBy; }

  // Business Methods
  addNode(node: Node): Workflow {
    if (this._nodes.has(node.id.value)) {
      throw new DuplicateNodeError(`Node with id ${node.id.value} already exists`);
    }

    const updatedNodes = new Map(this._nodes);
    updatedNodes.set(node.id.value, node);

    return this.createUpdatedWorkflow({ nodes: updatedNodes });
  }

  removeNode(nodeId: NodeId): Workflow {
    if (!this._nodes.has(nodeId.value)) {
      throw new NodeNotFoundError(`Node with id ${nodeId.value} not found`);
    }

    const updatedNodes = new Map(this._nodes);
    updatedNodes.delete(nodeId.value);

    // Remove connections involving this node
    const updatedConnections = this._connections.filter(
      conn => !conn.sourceNodeId.equals(nodeId) && !conn.targetNodeId.equals(nodeId)
    );

    return this.createUpdatedWorkflow({ 
      nodes: updatedNodes, 
      connections: updatedConnections 
    });
  }

  addConnection(connection: Connection): Workflow {
    this.validateConnection(connection);
    
    if (this.hasConnection(connection)) {
      throw new DuplicateConnectionError('Connection already exists');
    }

    if (this.wouldCreateCycle(connection)) {
      throw new CyclicConnectionError('Connection would create a cycle');
    }

    return this.createUpdatedWorkflow({
      connections: [...this._connections, connection]
    });
  }

  activate(): Workflow {
    this.validateForActivation();
    return this.createUpdatedWorkflow({ active: true });
  }

  deactivate(): Workflow {
    return this.createUpdatedWorkflow({ active: false });
  }

  updateSettings(settings: WorkflowSettings): Workflow {
    return this.createUpdatedWorkflow({ settings });
  }

  addTag(tag: string): Workflow {
    if (this._tags.includes(tag)) {
      return this;
    }
    return this.createUpdatedWorkflow({ tags: [...this._tags, tag] });
  }

  removeTag(tag: string): Workflow {
    const updatedTags = this._tags.filter(t => t !== tag);
    return this.createUpdatedWorkflow({ tags: updatedTags });
  }

  // Validation Methods
  private validateInvariants(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new InvalidWorkflowError('Workflow name cannot be empty');
    }

    if (this._name.length > 100) {
      throw new InvalidWorkflowError('Workflow name cannot exceed 100 characters');
    }

    if (this._description && this._description.length > 500) {
      throw new InvalidWorkflowError('Workflow description cannot exceed 500 characters');
    }
  }

  private validateConnection(connection: Connection): void {
    const sourceNode = this._nodes.get(connection.sourceNodeId.value);
    const targetNode = this._nodes.get(connection.targetNodeId.value);

    if (!sourceNode) {
      throw new InvalidConnectionError('Source node not found');
    }

    if (!targetNode) {
      throw new InvalidConnectionError('Target node not found');
    }

    if (!sourceNode.hasOutput(connection.sourceOutput)) {
      throw new InvalidConnectionError('Source node does not have the specified output');
    }

    if (!targetNode.hasInput(connection.targetInput)) {
      throw new InvalidConnectionError('Target node does not have the specified input');
    }
  }

  private validateForActivation(): void {
    if (this._nodes.size === 0) {
      throw new InvalidWorkflowError('Cannot activate empty workflow');
    }

    const triggerNodes = Array.from(this._nodes.values()).filter(node => node.isTrigger());
    if (triggerNodes.length === 0) {
      throw new InvalidWorkflowError('Workflow must have at least one trigger node to be activated');
    }

    // Validate all nodes are properly configured
    for (const node of this._nodes.values()) {
      if (!node.isValid()) {
        throw new InvalidWorkflowError(`Node ${node.name} is not properly configured`);
      }
    }

    // Validate workflow connectivity
    if (!this.isConnected()) {
      throw new InvalidWorkflowError('Workflow contains disconnected nodes');
    }
  }

  private hasConnection(connection: Connection): boolean {
    return this._connections.some(conn => conn.equals(connection));
  }

  private wouldCreateCycle(newConnection: Connection): boolean {
    const adjacencyList = this.buildAdjacencyList([...this._connections, newConnection]);
    return this.detectCycle(adjacencyList);
  }

  private buildAdjacencyList(connections: Connection[]): Map<string, string[]> {
    const adjacencyList = new Map<string, string[]>();
    
    for (const node of this._nodes.values()) {
      adjacencyList.set(node.id.value, []);
    }

    for (const connection of connections) {
      const sourceId = connection.sourceNodeId.value;
      const targetId = connection.targetNodeId.value;
      
      if (!adjacencyList.has(sourceId)) {
        adjacencyList.set(sourceId, []);
      }
      
      adjacencyList.get(sourceId)!.push(targetId);
    }

    return adjacencyList;
  }

  private detectCycle(adjacencyList: Map<string, string[]>): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of adjacencyList.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }

  private isConnected(): boolean {
    if (this._nodes.size <= 1) {
      return true;
    }

    const visited = new Set<string>();
    const queue: string[] = [];
    
    // Start from any node
    const startNode = this._nodes.values().next().value;
    queue.push(startNode.id.value);
    visited.add(startNode.id.value);

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      // Find all connected nodes (both directions)
      for (const connection of this._connections) {
        const sourceId = connection.sourceNodeId.value;
        const targetId = connection.targetNodeId.value;
        
        if (sourceId === currentNodeId && !visited.has(targetId)) {
          visited.add(targetId);
          queue.push(targetId);
        }
        
        if (targetId === currentNodeId && !visited.has(sourceId)) {
          visited.add(sourceId);
          queue.push(sourceId);
        }
      }
    }

    return visited.size === this._nodes.size;
  }

  private createUpdatedWorkflow(updates: Partial<{
    nodes: Map<string, Node>;
    connections: Connection[];
    settings: WorkflowSettings;
    tags: string[];
    active: boolean;
  }>): Workflow {
    return new Workflow(
      this._id,
      this._name,
      this._description,
      updates.nodes || this._nodes,
      updates.connections || this._connections,
      updates.settings || this._settings,
      updates.tags || this._tags,
      updates.active !== undefined ? updates.active : this._active,
      this._version + 1,
      this._createdAt,
      new Date(),
      this._createdBy
    );
  }
}

// 2. Value Objects Implementation
// libs/domain/workflow/value-objects/workflow-id.vo.ts
export class WorkflowId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new InvalidWorkflowIdError(`Invalid workflow ID: ${value}`);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: WorkflowId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  static generate(): WorkflowId {
    return new WorkflowId(uuidv4());
  }

  static fromString(value: string): WorkflowId {
    return new WorkflowId(value);
  }

  private isValid(value: string): boolean {
    // UUID v4 validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof value === 'string' && uuidRegex.test(value);
  }
}

// 3. Domain Services Implementation
// libs/domain/workflow/services/workflow-validator.service.ts
@Injectable()
export class WorkflowValidatorService {
  validateWorkflowForExecution(workflow: Workflow): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for trigger nodes
    const triggerNodes = workflow.nodes.filter(node => node.isTrigger());
    if (triggerNodes.length === 0) {
      errors.push('Workflow must have at least one trigger node');
    }

    // Check for disconnected nodes
    const disconnectedNodes = this.findDisconnectedNodes(workflow);
    if (disconnectedNodes.length > 0) {
      warnings.push(`Found ${disconnectedNodes.length} disconnected nodes`);
    }

    // Check for invalid node configurations
    for (const node of workflow.nodes) {
      if (!node.isValid()) {
        errors.push(`Node "${node.name}" has invalid configuration`);
      }
    }

    // Check for cycles in non-loop workflows
    if (!workflow.settings.allowLoops && this.hasCycles(workflow)) {
      errors.push('Workflow contains cycles but loops are not allowed');
    }

    // Check for required credentials
    const nodesWithMissingCredentials = this.findNodesWithMissingCredentials(workflow);
    if (nodesWithMissingCredentials.length > 0) {
      errors.push('Some nodes are missing required credentials');
    }

    return new ValidationResult(
      errors.length === 0,
      errors,
      warnings
    );
  }

  validateNodePlacement(workflow: Workflow, node: Node, position: NodePosition): ValidationResult {
    const errors: string[] = [];

    // Check for position conflicts
    const existingNodeAtPosition = workflow.nodes.find(n => 
      n.position.x === position.x && n.position.y === position.y
    );

    if (existingNodeAtPosition) {
      errors.push('Another node already exists at this position');
    }

    // Check canvas boundaries
    if (position.x < 0 || position.y < 0) {
      errors.push('Node position cannot be negative');
    }

    if (position.x > workflow.settings.canvasSize.width || 
        position.y > workflow.settings.canvasSize.height) {
      errors.push('Node position exceeds canvas boundaries');
    }

    return new ValidationResult(errors.length === 0, errors, []);
  }

  private findDisconnectedNodes(workflow: Workflow): Node[] {
    if (workflow.nodes.length <= 1) {
      return [];
    }

    const connectedNodes = new Set<string>();
    
    // Add all nodes that are part of connections
    for (const connection of workflow.connections) {
      connectedNodes.add(connection.sourceNodeId.value);
      connectedNodes.add(connection.targetNodeId.value);
    }

    return workflow.nodes.filter(node => !connectedNodes.has(node.id.value));
  }

  private hasCycles(workflow: Workflow): boolean {
    const adjacencyList = new Map<string, string[]>();
    
    // Build adjacency list
    for (const node of workflow.nodes) {
      adjacencyList.set(node.id.value, []);
    }

    for (const connection of workflow.connections) {
      const sourceId = connection.sourceNodeId.value;
      const targetId = connection.targetNodeId.value;
      adjacencyList.get(sourceId)!.push(targetId);
    }

    // DFS cycle detection
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of adjacencyList.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }

  private findNodesWithMissingCredentials(workflow: Workflow): Node[] {
    return workflow.nodes.filter(node => 
      node.requiresCredentials() && !node.hasValidCredentials()
    );
  }
}

// 4. Repository Interface
// libs/domain/workflow/repositories/workflow.repository.interface.ts
export interface IWorkflowRepository {
  findById(id: WorkflowId): Promise<Workflow | null>;
  findByUserId(userId: string, filters?: WorkflowFilters): Promise<Workflow[]>;
  findActiveWorkflows(): Promise<Workflow[]>;
  findByTags(tags: string[]): Promise<Workflow[]>;
  save(workflow: Workflow): Promise<void>;
  update(workflow: Workflow): Promise<void>;
  delete(id: WorkflowId): Promise<void>;
  exists(id: WorkflowId): Promise<boolean>;
  count(filters?: WorkflowFilters): Promise<number>;
  findDuplicatesByName(name: string, excludeId?: WorkflowId): Promise<Workflow[]>;
}

export interface WorkflowFilters {
  active?: boolean;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

// 5. Domain Events
// libs/domain/workflow/events/workflow.events.ts
export abstract class WorkflowDomainEvent {
  public readonly occurredAt: Date;
  public readonly workflowId: string;

  constructor(workflowId: string) {
    this.workflowId = workflowId;
    this.occurredAt = new Date();
  }
}

export class WorkflowCreatedEvent extends WorkflowDomainEvent {
  constructor(
    workflowId: string,
    public readonly workflowName: string,
    public readonly createdBy: string
  ) {
    super(workflowId);
  }
}

export class WorkflowUpdatedEvent extends WorkflowDomainEvent {
  constructor(
    workflowId: string,
    public readonly changes: WorkflowChange[],
    public readonly updatedBy: string
  ) {
    super(workflowId);
  }
}

export class WorkflowActivatedEvent extends WorkflowDomainEvent {
  constructor(
    workflowId: string,
    public readonly activatedBy: string
  ) {
    super(workflowId);
  }
}

export class WorkflowDeactivatedEvent extends WorkflowDomainEvent {
  constructor(
    workflowId: string,
    public readonly deactivatedBy: string
  ) {
    super(workflowId);
  }
}

export class WorkflowDeletedEvent extends WorkflowDomainEvent {
  constructor(
    workflowId: string,
    public readonly deletedBy: string
  ) {
    super(workflowId);
  }
}

export interface WorkflowChange {
  field: string;
  oldValue: any;
  newValue: any;
}

// 6. Execution Domain
// libs/domain/execution/entities/execution.entity.ts
export class WorkflowExecution {
  constructor(
    private readonly _id: ExecutionId,
    private readonly _workflowId: WorkflowId,
    private readonly _workflowSnapshot: WorkflowSnapshot,
    private readonly _input: ExecutionInput,
    private readonly _context: ExecutionContext,
    private _status: ExecutionStatus,
    private _steps: ExecutionStep[],
    private _output: ExecutionOutput | null,
    private _error: ExecutionError | null,
    private readonly _startedAt: Date,
    private _finishedAt: Date | null,
    private readonly _triggeredBy: string,
    private readonly _mode: ExecutionMode
  ) {}

  // Getters
  get id(): ExecutionId { return this._id; }
  get workflowId(): WorkflowId { return this._workflowId; }
  get workflowSnapshot(): WorkflowSnapshot { return this._workflowSnapshot; }
  get input(): ExecutionInput { return this._input; }
  get context(): ExecutionContext { return this._context; }
  get status(): ExecutionStatus { return this._status; }
  get steps(): ExecutionStep[] { return [...this._steps]; }
  get output(): ExecutionOutput | null { return this._output; }
  get error(): ExecutionError | null { return this._error; }
  get startedAt(): Date { return this._startedAt; }
  get finishedAt(): Date | null { return this._finishedAt; }
  get triggeredBy(): string { return this._triggeredBy; }
  get mode(): ExecutionMode { return this._mode; }
  get duration(): number | null {
    if (!this._finishedAt) return null;
    return this._finishedAt.getTime() - this._startedAt.getTime();
  }

  // Business Methods
  addStep(step: ExecutionStep): void {
    if (this._status === ExecutionStatus.COMPLETED || 
        this._status === ExecutionStatus.FAILED || 
        this._status === ExecutionStatus.CANCELLED) {
      throw new InvalidExecutionStateError('Cannot add steps to completed execution');
    }

    this._steps.push(step);
    this._status = ExecutionStatus.RUNNING;
  }

  complete(output: ExecutionOutput): void {
    if (this._status !== ExecutionStatus.RUNNING) {
      throw new InvalidExecutionStateError('Can only complete running executions');
    }

    this._status = ExecutionStatus.COMPLETED;
    this._output = output;
    this._finishedAt = new Date();
  }

  fail(error: ExecutionError): void {
    this._status = ExecutionStatus.FAILED;
    this._error = error;
    this._finishedAt = new Date();
  }

  cancel(reason: string): void {
    if (this._status === ExecutionStatus.COMPLETED || 
        this._status === ExecutionStatus.FAILED) {
      throw new InvalidExecutionStateError('Cannot cancel completed execution');
    }

    this._status = ExecutionStatus.CANCELLED;
    this._error = new ExecutionError('CANCELLED', reason);
    this._finishedAt = new Date();
  }

  pause(): void {
    if (this._status !== ExecutionStatus.RUNNING) {
      throw new InvalidExecutionStateError('Can only pause running executions');
    }

    this._status = ExecutionStatus.PAUSED;
  }

  resume(): void {
    if (this._status !== ExecutionStatus.PAUSED) {
      throw new InvalidExecutionStateError('Can only resume paused executions');
    }

    this._status = ExecutionStatus.RUNNING;
  }

  getCurrentStep(): ExecutionStep | null {
    return this._steps.length > 0 ? this._steps[this._steps.length - 1] : null;
  }

  getStepByNodeId(nodeId: string): ExecutionStep | null {
    return this._steps.find(step => step.nodeId === nodeId) || null;
  }

  getProgress(): ExecutionProgress {
    const totalNodes = this._workflowSnapshot.nodes.length;
    const completedNodes = this._steps.filter(step => 
      step.status === ExecutionStepStatus.COMPLETED
    ).length;

    return new ExecutionProgress(
      completedNodes,
      totalNodes,
      Math.round((completedNodes / totalNodes) * 100)
    );
  }

  static create(params: {
    workflowId: WorkflowId;
    workflowSnapshot: WorkflowSnapshot;
    input: ExecutionInput;
    context: ExecutionContext;
    triggeredBy: string;
    mode: ExecutionMode;
  }): WorkflowExecution {
    return new WorkflowExecution(
      ExecutionId.generate(),
      params.workflowId,
      params.workflowSnapshot,
      params.input,
      params.context,
      ExecutionStatus.PENDING,
      [],
      null,
      null,
      new Date(),
      null,
      params.triggeredBy,
      params.mode
    );
  }
}

// ========================================
// PHASE 3: APPLICATION LAYER IMPLEMENTATION
// ========================================

// 7. Command Handler Example
// libs/application/workflow/handlers/create-workflow.handler.ts
@CommandHandler(CreateWorkflowCommand)
export class CreateWorkflowHandler implements ICommandHandler<CreateWorkflowCommand, WorkflowDto> {
  constructor(
    @Inject('WORKFLOW_REPOSITORY')
    private readonly workflowRepository: IWorkflowRepository,
    
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    
    private readonly workflowValidator: WorkflowValidatorService,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async execute(command: CreateWorkflowCommand): Promise<WorkflowDto> {
    this.logger.info('Creating new workflow', {
      name: command.name,
      userId: command.userId
    });

    try {
      // 1. Validate user exists
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new UserNotFoundError(command.userId);
      }

      // 2. Check for duplicate names
      const duplicates = await this.workflowRepository.findDuplicatesByName(command.name);
      if (duplicates.length > 0) {
        throw new DuplicateWorkflowNameError(command.name);
      }

      // 3. Create workflow entity
      const workflowId = WorkflowId.generate();
      const workflow = new Workflow(
        workflowId,
        command.name,
        command.description || '',
        new Map(),
        [],
        WorkflowSettings.default(),
        command.tags || [],
        false,
        1,
        new Date(),
        new Date(),
        new UserId(command.userId)
      );

      // 4. Add initial nodes if provided
      let updatedWorkflow = workflow;
      if (command.initialNodes && command.initialNodes.length > 0) {
        for (const nodeData of command.initialNodes) {
          const node = this.createNodeFromData(nodeData);
          updatedWorkflow = updatedWorkflow.addNode(node);
        }
      }

      // 5. Add initial connections if provided
      if (command.initialConnections && command.initialConnections.length > 0) {
        for (const connectionData of command.initialConnections) {
          const connection = this.createConnectionFromData(connectionData);
          updatedWorkflow = updatedWorkflow.addConnection(connection);
        }
      }

      // 6. Validate workflow
      const validationResult = this.workflowValidator.validateWorkflowForExecution(updatedWorkflow);
      if (!validationResult.isValid && command.validateOnCreate) {
        throw new InvalidWorkflowError(validationResult.errors.join(', '));
      }

      // 7. Save workflow
      await this.workflowRepository.save(updatedWorkflow);

      // 8. Publish domain event
      await this.eventBus.publish(
        new WorkflowCreatedEvent(
          workflowId.value,
          command.name,
          command.userId
        )
      );

      this.logger.info('Workflow created successfully', {
        workflowId: workflowId.value,
        name: command.name,
        userId: command.userId
      });

      // 9. Return DTO
      return this.mapToDto(updatedWorkflow, validationResult);

    } catch (error) {
      this.logger.error('Failed to create workflow', {
        name: command.name,
        userId: command.userId,
        error: error.message
      });

      throw error;
    }
  }

  private createNodeFromData(nodeData: CreateNodeDto): Node {
    return new Node(
      NodeId.generate(),
      nodeData.type,
      nodeData.name,
      nodeData.parameters || {},
      new NodePosition(nodeData.position.x, nodeData.position.y),
      nodeData.credentialId ? new CredentialId(nodeData.credentialId) : null,
      nodeData.disabled || false
    );
  }

  private createConnectionFromData(connectionData: CreateConnectionDto): Connection {
    return new Connection(
      new NodeId(connectionData.sourceNodeId),
      connectionData.sourceOutput,
      new NodeId(connectionData.targetNodeId),
      connectionData.targetInput
    );
  }

  private mapToDto(workflow: Workflow, validationResult: ValidationResult): WorkflowDto {
    return {
      id: workflow.id.value,
      name: workflow.name,
      description: workflow.description,
      active: workflow.isActive,
      nodes: workflow.nodes.map(node => ({
        id: node.id.value,
        type: node.type,
        name: node.name,
        parameters: node.parameters,
        position: {
          x: node.position.x,
          y: node.position.y
        },
        credentialId: node.credentialId?.value,
        disabled: node.disabled
      })),
      connections: workflow.connections.map(conn => ({
        sourceNodeId: conn.sourceNodeId.value,
        sourceOutput: conn.sourceOutput,
        targetNodeId: conn.targetNodeId.value,
        targetInput: conn.targetInput
      })),
      tags: workflow.tags,
      version: workflow.version,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      createdBy: workflow.createdBy.value,
      validation: {
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      }
    };
  }
}