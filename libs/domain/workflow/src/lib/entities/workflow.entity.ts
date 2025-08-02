import { Node } from './node.entity';
import { Connection } from './connection.entity';
import { WorkflowId } from '../value-objects/workflow-id.value-object';

export class Workflow {
  constructor(
    private readonly _id: WorkflowId,
    private readonly _name: string,
    private readonly _nodes: Map<string, Node>,
    private readonly _connections: Connection[],
    private readonly _description: string,
    private readonly _settings: Record<string, any>,
    private readonly _tags: string[],
    private readonly _active: boolean,
    private readonly _version: number,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {
    this.validateInvariants();
  }

  activate(): void {
    this.validateForActivation();
    this._active = true;
    this.touch();
  }

  deactivate(): void {
    this._active = false;
    this.touch();
  }

  addNode(node: Node): Workflow {
    if (this._nodes.has(node.id.toString())) {
      throw new Error('Node already exists');
    }

    const newNodes = new Map(this._nodes);
    newNodes.set(node.id.toString(), node);
    return this.createUpdatedWorkflow({ nodes: newNodes });
  }

  removeNode(nodeId: string): Workflow {
    const newNodes = new Map(this._nodes);
    newNodes.delete(nodeId);

    const newConnections = this._connections.filter(
      (conn) => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );

    return this.createUpdatedWorkflow({ nodes: newNodes, connections: newConnections });
  }

  addConnection(connection: Connection): Workflow {
    this.validateConnection(connection);

    if (this.wouldCreateCycle(connection)) {
      throw new Error('Adding this connection would create a cycle');
    }

    return this.createUpdatedWorkflow({ connections: [...this._connections, connection] });
  }

  private createUpdatedWorkflow(updates: Partial<Workflow>): Workflow {
    return new Workflow(
      this._id,
      this._name,
      updates.nodes || this._nodes,
      updates.connections || this._connections,
      this._description,
      this._settings,
      this._tags,
      this._active,
      this._version + 1,
      this._createdAt,
      new Date()
    );
  }

  private validateInvariants(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Workflow name cannot be empty');
    }

    if (this._nodes.size === 0) {
      throw new Error('Workflow must have at least one node');
    }
  }

  private validateConnection(connection: Connection): void {
    if (!this._nodes.has(connection.sourceNodeId)) {
      throw new Error('Source node does not exist');
    }
    if (!this._nodes.has(connection.targetNodeId)) {
      throw new Error('Target node does not exist');
    }
  }

  private wouldCreateCycle(newConnection: Connection): boolean {
    const adjacencyList = this.buildAdjacencyList([...this._connections, newConnection]);
    return this.detectCycle(adjacencyList);
  }

  private buildAdjacencyList(connections: Connection[]): Map<string, string[]> {
    const adjacencyList = new Map<string, string[]>();

    for (const connection of connections) {
      if (!adjacencyList.has(connection.sourceNodeId)) {
        adjacencyList.set(connection.sourceNodeId, []);
      }
      adjacencyList.get(connection.sourceNodeId)!.push(connection.targetNodeId);
    }

    return adjacencyList;
  }

  private detectCycle(adjacencyList: Map<string, string[]>): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (recStack.has(node)) {
        return true;
      }
      if (visited.has(node)) {
        return false;
      }

      visited.add(node);
      recStack.add(node);

      const neighbors = adjacencyList.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of adjacencyList.keys()) {
      if (dfs(node)) {
        return true;
      }
    }

    return false;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
