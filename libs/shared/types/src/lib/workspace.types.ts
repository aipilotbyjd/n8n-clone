export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  settings: WorkspaceSettings;
  subscription: WorkspaceSubscription;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  allowSelfRegistration: boolean;
  defaultUserRole: UserRole;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  maxExecutionTime: number;
  executionDataRetention: number; // days
  allowedDomains?: string[];
  logo?: string;
  primaryColor?: string;
  timezone: string;
  language: string;
}

export interface WorkspaceSubscription {
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  maxUsers: number;
  maxWorkflows: number;
  maxExecutionsPerMonth: number;
  features: string[];
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: Date;
  isActive: boolean;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  permissions: Permission[];
  invitedBy?: string;
  joinedAt: Date;
  isActive: boolean;
}

export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  leaderId: string;
  members: TeamMember[];
  permissions: TeamPermission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: Date;
}

export enum TeamRole {
  LEAD = 'lead',
  MEMBER = 'member',
}

export interface TeamPermission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface InviteUserDto {
  email: string;
  role: WorkspaceRole;
  sendEmail: boolean;
  message?: string;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  leaderId: string;
  memberIds?: string[];
  permissions?: TeamPermission[];
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  leaderId?: string;
  permissions?: TeamPermission[];
}

export interface AddTeamMemberDto {
  userId: string;
  role: TeamRole;
}

// Import types from user.types.ts
import { UserRole, Permission, PermissionAction, PermissionResource, PasswordPolicy } from './user.types';
