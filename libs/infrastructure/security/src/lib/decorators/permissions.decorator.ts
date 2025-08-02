import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PermissionResource, PermissionAction, User } from '@n8n-clone/shared/types';
import { RequiredPermission } from '../guards/permissions.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: RequiredPermission[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequirePermission = (resource: PermissionResource, action: PermissionAction) =>
  RequirePermissions({ resource, action });

// User roles decorators
export const RequireAdmin = () => RequirePermission(PermissionResource.USER, PermissionAction.MANAGE);
export const RequireEditor = () => RequirePermissions(
  { resource: PermissionResource.WORKFLOW, action: PermissionAction.CREATE }
);
export const RequireViewer = () => RequirePermissions(
  { resource: PermissionResource.WORKFLOW, action: PermissionAction.READ }
);

// Resource-specific decorators
export const RequireWorkflowCreate = () => RequirePermission(PermissionResource.WORKFLOW, PermissionAction.CREATE);
export const RequireWorkflowRead = () => RequirePermission(PermissionResource.WORKFLOW, PermissionAction.READ);
export const RequireWorkflowUpdate = () => RequirePermission(PermissionResource.WORKFLOW, PermissionAction.UPDATE);
export const RequireWorkflowDelete = () => RequirePermission(PermissionResource.WORKFLOW, PermissionAction.DELETE);
export const RequireWorkflowExecute = () => RequirePermission(PermissionResource.WORKFLOW, PermissionAction.EXECUTE);

export const RequireCredentialCreate = () => RequirePermission(PermissionResource.CREDENTIAL, PermissionAction.CREATE);
export const RequireCredentialRead = () => RequirePermission(PermissionResource.CREDENTIAL, PermissionAction.READ);
export const RequireCredentialUpdate = () => RequirePermission(PermissionResource.CREDENTIAL, PermissionAction.UPDATE);
export const RequireCredentialDelete = () => RequirePermission(PermissionResource.CREDENTIAL, PermissionAction.DELETE);

export const RequireUserManage = () => RequirePermission(PermissionResource.USER, PermissionAction.MANAGE);
export const RequireWorkspaceManage = () => RequirePermission(PermissionResource.WORKSPACE, PermissionAction.MANAGE);

// Parameter decorators
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

export const CurrentWorkspaceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.workspaceId;
  },
);

export const UserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.role;
  },
);

// Rate limiting decorator
export const RATE_LIMIT_KEY = 'rateLimit';
export interface RateLimitOptions {
  ttl: number; // Time to live in seconds
  limit: number; // Maximum number of requests
}

export const RateLimit = (options: RateLimitOptions) => 
  SetMetadata(RATE_LIMIT_KEY, options);

// Common rate limits
export const RateLimitStrict = () => RateLimit({ ttl: 60, limit: 10 }); // 10 requests per minute
export const RateLimitModerate = () => RateLimit({ ttl: 60, limit: 30 }); // 30 requests per minute
export const RateLimitLenient = () => RateLimit({ ttl: 60, limit: 100 }); // 100 requests per minute

// Session management decorator
export const REQUIRE_FRESH_SESSION_KEY = 'requireFreshSession';
export const RequireFreshSession = (maxAge = 300) => // 5 minutes default
  SetMetadata(REQUIRE_FRESH_SESSION_KEY, maxAge);

// MFA requirement decorator
export const REQUIRE_MFA_KEY = 'requireMfa';
export const RequireMFA = () => SetMetadata(REQUIRE_MFA_KEY, true);

// Audit logging decorator
export const AUDIT_LOG_KEY = 'auditLog';
interface AuditLogOptions {
  action: string;
  resource?: string;
  sensitiveFields?: string[];
}

export const AuditLog = (options: AuditLogOptions) => 
  SetMetadata(AUDIT_LOG_KEY, options);

// Common audit decorators
export const AuditUserAction = (action: string) => AuditLog({ action, resource: 'user' });
export const AuditWorkflowAction = (action: string) => AuditLog({ action, resource: 'workflow' });
export const AuditCredentialAction = (action: string) => AuditLog({ 
  action, 
  resource: 'credential',
  sensitiveFields: ['password', 'token', 'secret']
});

// IP restriction decorator
export const IP_WHITELIST_KEY = 'ipWhitelist';
export const IPWhitelist = (allowedIPs: string[]) => 
  SetMetadata(IP_WHITELIST_KEY, allowedIPs);

// API version decorator
export const API_VERSION_KEY = 'apiVersion';
export const ApiVersion = (version: string) => 
  SetMetadata(API_VERSION_KEY, version);
