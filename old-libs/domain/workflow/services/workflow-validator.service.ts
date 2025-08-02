import { Workflow } from '../entities/workflow.entity';
import { ValidationResult, ValidationResultBuilder } from '@n8n-clone/shared';

export class WorkflowValidator {
  static validate(workflow: Workflow): ValidationResult {
    const builder = new ValidationResultBuilder();

    // Check if workflow has at least one trigger node
    const triggerNodes = workflow.nodes.filter(node => node.isStartNode());
    if (triggerNodes.length === 0) {
      builder.addError('Workflow must have at least one trigger node');
    }

    // Check for circular dependencies
    if (this.hasCircularDependencies(workflow)) {
      builder.addError('Workflow contains circular dependencies');
    }

    // Check if all connections are valid
    const invalidConnections = this.validateConnections(workflow);
    if (invalidConnections.length > 0) {
      builder.addErrors(invalidConnections);
    }

    // Check for orphaned nodes (nodes with no path to trigger)
    const orphanedNodes = this.findOrphanedNodes(workflow);
    if (orphanedNodes.length > 0) {
      builder.addWarnings(orphanedNodes.map(node => `Node "${node.name}" is not connected to any trigger`));
    }

    return builder.build();
  }

  private static hasCircularDependencies(workflow: Workflow): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of workflow.nodes) {
      if (!visited.has(node.id.value)) {
        if (this.hasCircularDependenciesUtil(workflow, node.id.value, visited, recursionStack)) {
          return true;
        }
      }
    }
    return false;
  }

  private static hasCircularDependenciesUtil(
    workflow: Workflow,
    nodeId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingConnections = workflow.connections.filter(conn => conn.sourceNodeId === nodeId);
    
    for (const connection of outgoingConnections) {
      if (!visited.has(connection.targetNodeId)) {
        if (this.hasCircularDependenciesUtil(workflow, connection.targetNodeId, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(connection.targetNodeId)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  private static validateConnections(workflow: Workflow): string[] {
    const errors: string[] = [];
    const nodeIds = new Set(workflow.nodes.map(n => n.id.value));

    for (const connection of workflow.connections) {
      if (!nodeIds.has(connection.sourceNodeId)) {
        errors.push(`Connection references non-existent source node: ${connection.sourceNodeId}`);
      }
      if (!nodeIds.has(connection.targetNodeId)) {
        errors.push(`Connection references non-existent target node: ${connection.targetNodeId}`);
      }
    }

    return errors;
  }

  private static findOrphanedNodes(workflow: Workflow): any[] {
    const triggerNodes = workflow.nodes.filter(node => node.isStartNode());
    const reachableNodes = new Set<string>();

    // DFS from each trigger node to find all reachable nodes
    for (const trigger of triggerNodes) {
      this.markReachableNodes(workflow, trigger.id.value, reachableNodes);
    }

    return workflow.nodes.filter(node => !reachableNodes.has(node.id.value) && !node.isStartNode());
  }

  private static markReachableNodes(workflow: Workflow, nodeId: string, reachableNodes: Set<string>): void {
    if (reachableNodes.has(nodeId)) return;
    
    reachableNodes.add(nodeId);
    const outgoingConnections = workflow.connections.filter(conn => conn.sourceNodeId === nodeId);
    
    for (const connection of outgoingConnections) {
      this.markReachableNodes(workflow, connection.targetNodeId, reachableNodes);
    }
  }
}
