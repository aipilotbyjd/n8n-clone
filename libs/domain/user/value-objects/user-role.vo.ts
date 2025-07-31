export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export const USER_ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: 5,
  [UserRole.ADMIN]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.USER]: 2,
  [UserRole.VIEWER]: 1
};

export const USER_ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
    'manage_system',
    'manage_users',
    'manage_workspaces',
    'manage_workflows',
    'execute_workflows',
    'view_all_data',
    'manage_integrations',
    'manage_credentials'
  ],
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_workspaces',
    'manage_workflows',
    'execute_workflows',
    'view_all_data',
    'manage_integrations',
    'manage_credentials'
  ],
  [UserRole.MANAGER]: [
    'manage_workflows',
    'execute_workflows',
    'view_team_data',
    'manage_team_credentials'
  ],
  [UserRole.USER]: [
    'create_workflows',
    'execute_workflows',
    'view_own_data',
    'manage_own_credentials'
  ],
  [UserRole.VIEWER]: [
    'view_workflows',
    'view_own_data'
  ]
};

export class UserRoleValue {
  constructor(private readonly _role: UserRole) {}

  get value(): UserRole {
    return this._role;
  }

  get level(): number {
    return USER_ROLE_HIERARCHY[this._role];
  }

  get permissions(): string[] {
    return [...USER_ROLE_PERMISSIONS[this._role]];
  }

  // Business methods
  canManageUsers(): boolean {
    return this.hasPermission('manage_users');
  }

  canManageWorkflows(): boolean {
    return this.hasPermission('manage_workflows') || this.hasPermission('create_workflows');
  }

  canExecuteWorkflows(): boolean {
    return this.hasPermission('execute_workflows');
  }

  canViewAllData(): boolean {
    return this.hasPermission('view_all_data');
  }

  canManageCredentials(): boolean {
    return this.hasPermission('manage_credentials') || this.hasPermission('manage_own_credentials');
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  isHigherThan(other: UserRole | UserRoleValue): boolean {
    const otherLevel = other instanceof UserRoleValue ? other.level : USER_ROLE_HIERARCHY[other];
    return this.level > otherLevel;
  }

  isLowerThan(other: UserRole | UserRoleValue): boolean {
    const otherLevel = other instanceof UserRoleValue ? other.level : USER_ROLE_HIERARCHY[other];
    return this.level < otherLevel;
  }

  equals(other: UserRole | UserRoleValue): boolean {
    const otherRole = other instanceof UserRoleValue ? other.value : other;
    return this._role === otherRole;
  }

  toString(): string {
    return this._role;
  }

  // Static methods
  static fromString(role: string): UserRoleValue {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new Error(`Invalid user role: ${role}`);
    }
    return new UserRoleValue(role as UserRole);
  }

  static getAvailableRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  static getMaximumRole(): UserRole {
    return UserRole.SUPER_ADMIN;
  }

  static getMinimumRole(): UserRole {
    return UserRole.VIEWER;
  }
}
