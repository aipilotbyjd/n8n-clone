export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: UserRole;
  workspaceId?: string;
  profile: UserProfile;
  preferences: UserPreferences;
  security: UserSecurity;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  OWNER = 'owner',
}

export interface UserProfile {
  avatar?: string;
  timezone: string;
  language: string;
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  bio?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  emailNotifications: boolean;
  slackNotifications: boolean;
  webhookNotifications: boolean;
  executionNotifications: boolean;
  marketingEmails: boolean;
}

export interface UserSecurity {
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  passwordLastChanged: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  sessionTimeout: number; // in minutes
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  SHARE = 'share',
  MANAGE = 'manage',
}

export enum PermissionResource {
  WORKFLOW = 'workflow',
  CREDENTIAL = 'credential',
  USER = 'user',
  WORKSPACE = 'workspace',
  EXECUTION = 'execution',
  TEMPLATE = 'template',
  VARIABLE = 'variable',
}

export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  workspaceId?: string;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
  sendInviteEmail?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: UserRole;
  status?: string;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}

export interface LoginDto {
  email: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // Number of previous passwords to check
  maxAge: number; // Days before password expires
  lockoutAttempts: number;
  lockoutDuration: number; // Minutes
}

export interface AuthResponseDto {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface MfaSetupDto {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface VerifyMfaDto {
  code: string;
  mfaToken?: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
