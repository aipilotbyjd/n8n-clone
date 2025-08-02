import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';
import { PermissionResource, PermissionAction, User } from '@n8n-clone/shared/types';

export interface RequiredPermission {
  resource: PermissionResource;
  action: PermissionAction;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = this.rbacService.hasAnyPermission(user, requiredPermissions);

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private rbacService: RbacService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const resourceOwnerId = request.params.ownerId || request.body.ownerId;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // If no resource owner specified, allow (will be handled by other guards)
    if (!resourceOwnerId) {
      return true;
    }

    // Allow if user is the owner or has admin privileges
    if (user.id === resourceOwnerId || user.role === 'admin' || user.role === 'owner') {
      return true;
    }

    throw new ForbiddenException('Access denied: insufficient permissions for this resource');
  }
}

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private rbacService: RbacService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const workspaceId = request.params.workspaceId || request.body.workspaceId || request.headers['x-workspace-id'];
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // If no workspace specified, allow (will be handled by other guards)
    if (!workspaceId) {
      return true;
    }

    // Check if user belongs to the workspace
    if (user.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied: user does not belong to this workspace');
    }

    return true;
  }
}
