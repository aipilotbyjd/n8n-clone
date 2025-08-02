import { Injectable } from '@nestjs/common';
import { 
  UserRole, 
  Permission, 
  PermissionAction, 
  PermissionResource, 
  RolePermission,
  User 
} from '@n8n-clone/shared/types';

@Injectable()
export class RbacService {
  private readonly rolePermissions: Map<UserRole, Permission[]> = new Map();

  constructor() {
    this.initializeRolePermissions();
  }

  private initializeRolePermissions(): void {
    // Admin role - full access to everything
    const adminPermissions: Permission[] = [
      // User management
      { id: 'user.create', name: 'Create User', resource: PermissionResource.USER, action: PermissionAction.CREATE },
      { id: 'user.read', name: 'Read User', resource: PermissionResource.USER, action: PermissionAction.READ },
      { id: 'user.update', name: 'Update User', resource: PermissionResource.USER, action: PermissionAction.UPDATE },
      { id: 'user.delete', name: 'Delete User', resource: PermissionResource.USER, action: PermissionAction.DELETE },
      { id: 'user.manage', name: 'Manage User', resource: PermissionResource.USER, action: PermissionAction.MANAGE },
      
      // Workspace management
      { id: 'workspace.create', name: 'Create Workspace', resource: PermissionResource.WORKSPACE, action: PermissionAction.CREATE },
      { id: 'workspace.read', name: 'Read Workspace', resource: PermissionResource.WORKSPACE, action: PermissionAction.READ },
      { id: 'workspace.update', name: 'Update Workspace', resource: PermissionResource.WORKSPACE, action: PermissionAction.UPDATE },
      { id: 'workspace.delete', name: 'Delete Workspace', resource: PermissionResource.WORKSPACE, action: PermissionAction.DELETE },
      { id: 'workspace.manage', name: 'Manage Workspace', resource: PermissionResource.WORKSPACE, action: PermissionAction.MANAGE },
      
      // Workflow management
      { id: 'workflow.create', name: 'Create Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.CREATE },
      { id: 'workflow.read', name: 'Read Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.READ },
      { id: 'workflow.update', name: 'Update Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.UPDATE },
      { id: 'workflow.delete', name: 'Delete Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.DELETE },
      { id: 'workflow.execute', name: 'Execute Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.EXECUTE },
      { id: 'workflow.share', name: 'Share Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.SHARE },
      
      // Credential management
      { id: 'credential.create', name: 'Create Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.CREATE },
      { id: 'credential.read', name: 'Read Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.READ },
      { id: 'credential.update', name: 'Update Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.UPDATE },
      { id: 'credential.delete', name: 'Delete Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.DELETE },
      { id: 'credential.share', name: 'Share Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.SHARE },
      
      // Execution management
      { id: 'execution.read', name: 'Read Execution', resource: PermissionResource.EXECUTION, action: PermissionAction.READ },
      { id: 'execution.delete', name: 'Delete Execution', resource: PermissionResource.EXECUTION, action: PermissionAction.DELETE },
      
      // Template management
      { id: 'template.create', name: 'Create Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.CREATE },
      { id: 'template.read', name: 'Read Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.READ },
      { id: 'template.update', name: 'Update Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.UPDATE },
      { id: 'template.delete', name: 'Delete Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.DELETE },
      { id: 'template.share', name: 'Share Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.SHARE },
      
      // Variable management
      { id: 'variable.create', name: 'Create Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.CREATE },
      { id: 'variable.read', name: 'Read Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.READ },
      { id: 'variable.update', name: 'Update Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.UPDATE },
      { id: 'variable.delete', name: 'Delete Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.DELETE },
    ];

    // Editor role - can create and edit workflows, credentials, and templates
    const editorPermissions: Permission[] = [
      // Workflow management (full access)
      { id: 'workflow.create', name: 'Create Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.CREATE },
      { id: 'workflow.read', name: 'Read Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.READ },
      { id: 'workflow.update', name: 'Update Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.UPDATE },
      { id: 'workflow.delete', name: 'Delete Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.DELETE },
      { id: 'workflow.execute', name: 'Execute Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.EXECUTE },
      { id: 'workflow.share', name: 'Share Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.SHARE },
      
      // Credential management (full access)
      { id: 'credential.create', name: 'Create Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.CREATE },
      { id: 'credential.read', name: 'Read Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.READ },
      { id: 'credential.update', name: 'Update Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.UPDATE },
      { id: 'credential.delete', name: 'Delete Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.DELETE },
      { id: 'credential.share', name: 'Share Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.SHARE },
      
      // Execution management (read only)
      { id: 'execution.read', name: 'Read Execution', resource: PermissionResource.EXECUTION, action: PermissionAction.READ },
      
      // Template management (full access)
      { id: 'template.create', name: 'Create Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.CREATE },
      { id: 'template.read', name: 'Read Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.READ },
      { id: 'template.update', name: 'Update Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.UPDATE },
      { id: 'template.delete', name: 'Delete Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.DELETE },
      { id: 'template.share', name: 'Share Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.SHARE },
      
      // Variable management (limited)
      { id: 'variable.read', name: 'Read Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.READ },
      { id: 'variable.create', name: 'Create Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.CREATE },
      { id: 'variable.update', name: 'Update Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.UPDATE },
      
      // User management (read only)
      { id: 'user.read', name: 'Read User', resource: PermissionResource.USER, action: PermissionAction.READ },
    ];

    // Viewer role - read-only access
    const viewerPermissions: Permission[] = [
      // Workflow management (read and execute only)
      { id: 'workflow.read', name: 'Read Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.READ },
      { id: 'workflow.execute', name: 'Execute Workflow', resource: PermissionResource.WORKFLOW, action: PermissionAction.EXECUTE },
      
      // Credential management (read only)
      { id: 'credential.read', name: 'Read Credential', resource: PermissionResource.CREDENTIAL, action: PermissionAction.READ },
      
      // Execution management (read only)
      { id: 'execution.read', name: 'Read Execution', resource: PermissionResource.EXECUTION, action: PermissionAction.READ },
      
      // Template management (read only)
      { id: 'template.read', name: 'Read Template', resource: PermissionResource.TEMPLATE, action: PermissionAction.READ },
      
      // Variable management (read only)
      { id: 'variable.read', name: 'Read Variable', resource: PermissionResource.VARIABLE, action: PermissionAction.READ },
    ];

    // Owner role - same as admin for now
    const ownerPermissions: Permission[] = [...adminPermissions];

    this.rolePermissions.set(UserRole.ADMIN, adminPermissions);
    this.rolePermissions.set(UserRole.EDITOR, editorPermissions);
    this.rolePermissions.set(UserRole.VIEWER, viewerPermissions);
    this.rolePermissions.set(UserRole.OWNER, ownerPermissions);
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(user: User, resource: PermissionResource, action: PermissionAction): boolean {
    const userPermissions = this.getUserPermissions(user);
    return userPermissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  /**
   * Check if a user has any of the specified permissions
   */
  hasAnyPermission(user: User, requiredPermissions: Array<{ resource: PermissionResource; action: PermissionAction }>): boolean {
    return requiredPermissions.some(required => 
      this.hasPermission(user, required.resource, required.action)
    );
  }

  /**
   * Check if a user has all of the specified permissions
   */
  hasAllPermissions(user: User, requiredPermissions: Array<{ resource: PermissionResource; action: PermissionAction }>): boolean {
    return requiredPermissions.every(required => 
      this.hasPermission(user, required.resource, required.action)
    );
  }

  /**
   * Get all permissions for a user based on their role
   */
  getUserPermissions(user: User): Permission[] {
    return this.rolePermissions.get(user.role) || [];
  }

  /**
   * Get all permissions for a specific role
   */
  getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions.get(role) || [];
  }

  /**
   * Check if a role has a specific permission
   */
  roleHasPermission(role: UserRole, resource: PermissionResource, action: PermissionAction): boolean {
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): Permission[] {
    const allPermissions = new Map<string, Permission>();
    
    this.rolePermissions.forEach(permissions => {
      permissions.forEach(permission => {
        allPermissions.set(permission.id, permission);
      });
    });

    return Array.from(allPermissions.values());
  }

  /**
   * Check if a user can access a resource owned by another user
   */
  canAccessResource(user: User, resourceOwnerId: string, resource: PermissionResource, action: PermissionAction): boolean {
    // Users can always access their own resources
    if (user.id === resourceOwnerId) {
      return this.hasPermission(user, resource, action);
    }

    // Check if user has the permission and is admin/owner
    if (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) {
      return this.hasPermission(user, resource, action);
    }

    // For shared resources, check if user has read permission
    if (action === PermissionAction.READ) {
      return this.hasPermission(user, resource, action);
    }

    return false;
  }

  /**
   * Filter resources based on user permissions
   */
  filterAccessibleResources<T extends { id: string; ownerId: string }>(
    user: User,
    resources: T[],
    resource: PermissionResource,
    action: PermissionAction
  ): T[] {
    return resources.filter(item => 
      this.canAccessResource(user, item.ownerId, resource, action)
    );
  }

  /**
   * Check if user can perform action in workspace context
   */
  canPerformInWorkspace(
    user: User, 
    workspaceId: string, 
    resource: PermissionResource, 
    action: PermissionAction
  ): boolean {
    // Check if user belongs to the workspace
    if (user.workspaceId !== workspaceId) {
      return false;
    }

    return this.hasPermission(user, resource, action);
  }

  /**
   * Get permission summary for a user
   */
  getUserPermissionSummary(user: User): {
    role: UserRole;
    permissions: Permission[];
    canManageUsers: boolean;
    canManageWorkspace: boolean;
    canCreateWorkflows: boolean;
    canExecuteWorkflows: boolean;
    canManageCredentials: boolean;
  } {
    const permissions = this.getUserPermissions(user);
    
    return {
      role: user.role,
      permissions,
      canManageUsers: this.hasPermission(user, PermissionResource.USER, PermissionAction.MANAGE),
      canManageWorkspace: this.hasPermission(user, PermissionResource.WORKSPACE, PermissionAction.MANAGE),
      canCreateWorkflows: this.hasPermission(user, PermissionResource.WORKFLOW, PermissionAction.CREATE),
      canExecuteWorkflows: this.hasPermission(user, PermissionResource.WORKFLOW, PermissionAction.EXECUTE),
      canManageCredentials: this.hasPermission(user, PermissionResource.CREDENTIAL, PermissionAction.CREATE),
    };
  }
}
