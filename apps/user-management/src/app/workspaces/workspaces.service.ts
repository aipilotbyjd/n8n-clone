import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { 
  Workspace, 
  WorkspaceMember, 
  WorkspaceInvitation,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  InviteUserDto,
  WorkspaceRole,
  User
} from '@n8n-clone/shared/types';
import { JwtAuthService } from '@n8n-clone/infrastructure/security';
import { v4 as uuidv4 } from 'uuid';

export interface WorkspaceStats {
  totalMembers: number;
  totalWorkflows: number;
  totalExecutions: number;
  monthlyExecutions: number;
  storageUsed: number; // in bytes
}

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly jwtAuthService: JwtAuthService
  ) {}

  async createWorkspace(dto: CreateWorkspaceDto, ownerId: string): Promise<Workspace> {
    this.logger.log(`Creating workspace: ${dto.name} for user: ${ownerId}`);

    // Check if user already owns a workspace (for free plan)
    const existingWorkspaces = await this.getUserWorkspaces(ownerId);
    if (existingWorkspaces.length > 0) {
      throw new ConflictException('User already owns a workspace. Upgrade to create multiple workspaces.');
    }

    const workspace: Workspace = {
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      ownerId,
      settings: {
        allowSelfRegistration: false,
        defaultUserRole: 'viewer' as any,
        passwordPolicy: {
          minLength: 8,
          maxLength: 128,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          preventReuse: 3,
          maxAge: 90,
          lockoutAttempts: 5,
          lockoutDuration: 30,
        },
        sessionTimeout: 480, // 8 hours
        maxExecutionTime: 3600, // 1 hour
        executionDataRetention: 30, // 30 days
        timezone: 'UTC',
        language: 'en',
        ...dto.settings,
      },
      subscription: {
        plan: 'free',
        maxUsers: 3,
        maxWorkflows: 5,
        maxExecutionsPerMonth: 1000,
        features: ['basic-nodes', 'webhook-triggers', 'email-support'],
        billingCycle: 'monthly',
        isActive: true,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would use a command
    // const command = new CreateWorkspaceCommand(workspace);
    // await this.commandBus.execute(command);

    this.logger.log(`Workspace created successfully: ${workspace.id}`);
    return workspace;
  }

  async getWorkspace(workspaceId: string, userId?: string): Promise<Workspace> {
    // In a real implementation, this would use a query
    // const query = new GetWorkspaceQuery(workspaceId, userId);
    // return await this.queryBus.execute(query);

    // Mock implementation
    const workspace: Workspace = {
      id: workspaceId,
      name: 'Sample Workspace',
      ownerId: userId || 'owner-id',
      settings: {
        allowSelfRegistration: false,
        defaultUserRole: 'viewer' as any,
        passwordPolicy: {
          minLength: 8,
          maxLength: 128,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          preventReuse: 3,
          maxAge: 90,
          lockoutAttempts: 5,
          lockoutDuration: 30,
        },
        sessionTimeout: 480,
        maxExecutionTime: 3600,
        executionDataRetention: 30,
        timezone: 'UTC',
        language: 'en',
      },
      subscription: {
        plan: 'free',
        maxUsers: 3,
        maxWorkflows: 5,
        maxExecutionsPerMonth: 1000,
        features: ['basic-nodes'],
        billingCycle: 'monthly',
        isActive: true,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return workspace;
  }

  async updateWorkspace(workspaceId: string, dto: UpdateWorkspaceDto, userId: string): Promise<Workspace> {
    this.logger.log(`Updating workspace: ${workspaceId} by user: ${userId}`);

    const workspace = await this.getWorkspace(workspaceId, userId);
    
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owners can update workspace settings');
    }

    // In a real implementation, this would use a command
    // const command = new UpdateWorkspaceCommand(workspaceId, dto, userId);
    // return await this.commandBus.execute(command);

    const updatedWorkspace: Workspace = {
      ...workspace,
      name: dto.name || workspace.name,
      description: dto.description || workspace.description,
      settings: {
        ...workspace.settings,
        ...dto.settings,
      },
      updatedAt: new Date(),
    };

    this.logger.log(`Workspace updated successfully: ${workspaceId}`);
    return updatedWorkspace;
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting workspace: ${workspaceId} by user: ${userId}`);

    const workspace = await this.getWorkspace(workspaceId, userId);
    
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owners can delete the workspace');
    }

    // In a real implementation, this would:
    // 1. Check if there are any active workflows
    // 2. Archive or transfer ownership of workflows
    // 3. Remove all members
    // 4. Delete the workspace
    // const command = new DeleteWorkspaceCommand(workspaceId, userId);
    // await this.commandBus.execute(command);

    this.logger.log(`Workspace deleted successfully: ${workspaceId}`);
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    // In a real implementation, this would use a query
    // const query = new GetUserWorkspacesQuery(userId);
    // return await this.queryBus.execute(query);

    // Mock implementation
    return [];
  }

  async getWorkspaceMembers(workspaceId: string, userId: string): Promise<WorkspaceMember[]> {
    this.logger.log(`Getting workspace members for: ${workspaceId}`);

    // Verify user has access to workspace
    await this.getWorkspace(workspaceId, userId);

    // In a real implementation, this would use a query
    // const query = new GetWorkspaceMembersQuery(workspaceId);
    // return await this.queryBus.execute(query);

    // Mock implementation
    const members: WorkspaceMember[] = [];
    return members;
  }

  async inviteUser(workspaceId: string, dto: InviteUserDto, inviterId: string): Promise<WorkspaceInvitation> {
    this.logger.log(`Inviting user ${dto.email} to workspace: ${workspaceId}`);

    const workspace = await this.getWorkspace(workspaceId, inviterId);
    
    // Check if inviter has permission to invite users
    const members = await this.getWorkspaceMembers(workspaceId, inviterId);
    const inviterMember = members.find(m => m.userId === inviterId);
    
    if (workspace.ownerId !== inviterId && 
        (!inviterMember || inviterMember.role !== WorkspaceRole.ADMIN)) {
      throw new ForbiddenException('Only workspace owners and admins can invite users');
    }

    // Check subscription limits
    if (members.length >= workspace.subscription.maxUsers) {
      throw new ConflictException('Workspace has reached maximum user limit. Please upgrade your subscription.');
    }

    // Generate invitation token
    const token = this.jwtAuthService.generateInvitationToken(workspaceId, dto.email, dto.role);

    const invitation: WorkspaceInvitation = {
      id: uuidv4(),
      workspaceId,
      email: dto.email,
      role: dto.role,
      invitedBy: inviterId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      createdAt: new Date(),
    };

    // In a real implementation, this would:
    // 1. Save invitation to database
    // 2. Send invitation email if requested
    // const command = new CreateInvitationCommand(invitation);
    // await this.commandBus.execute(command);

    if (dto.sendEmail) {
      await this.sendInvitationEmail(invitation, workspace, dto.message);
    }

    this.logger.log(`User invitation created: ${invitation.id}`);
    return invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<WorkspaceMember> {
    this.logger.log(`Accepting invitation with token for user: ${userId}`);

    // Verify invitation token
    const invitation = await this.jwtAuthService.verifyInvitationToken(token);
    
    // In a real implementation, this would:
    // 1. Verify invitation exists and is still valid
    // 2.   
    // 3. Add user to workspace
    // 4. Mark invitation as accepted

    const member: WorkspaceMember = {
      id: uuidv4(),
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role as WorkspaceRole,
      permissions: [],
      invitedBy: '', // Would be fetched from invitation
      joinedAt: new Date(),
      isActive: true,
    };

    this.logger.log(`Invitation accepted, user added to workspace: ${member.id}`);
    return member;
  }

  async removeUser(workspaceId: string, memberUserId: string, removerId: string): Promise<void> {
    this.logger.log(`Removing user ${memberUserId} from workspace: ${workspaceId}`);

    const workspace = await this.getWorkspace(workspaceId, removerId);
    const members = await this.getWorkspaceMembers(workspaceId, removerId);
    
    const removerMember = members.find(m => m.userId === removerId);
    const targetMember = members.find(m => m.userId === memberUserId);

    if (!targetMember) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    // Check permissions
    if (workspace.ownerId !== removerId && 
        (!removerMember || removerMember.role !== WorkspaceRole.ADMIN)) {
      throw new ForbiddenException('Only workspace owners and admins can remove users');
    }

    // Cannot remove workspace owner
    if (workspace.ownerId === memberUserId) {
      throw new ForbiddenException('Cannot remove workspace owner');
    }

    // In a real implementation, this would:
    // 1. Transfer ownership of user's workflows
    // 2. Remove user from workspace
    // const command = new RemoveWorkspaceMemberCommand(workspaceId, memberUserId, removerId);
    // await this.commandBus.execute(command);

    this.logger.log(`User removed from workspace successfully`);
  }

  async updateMemberRole(
    workspaceId: string, 
    memberUserId: string, 
    newRole: WorkspaceRole, 
    updaterId: string
  ): Promise<WorkspaceMember> {
    this.logger.log(`Updating user ${memberUserId} role to ${newRole} in workspace: ${workspaceId}`);

    const workspace = await this.getWorkspace(workspaceId, updaterId);
    const members = await this.getWorkspaceMembers(workspaceId, updaterId);
    
    const updaterMember = members.find(m => m.userId === updaterId);
    const targetMember = members.find(m => m.userId === memberUserId);

    if (!targetMember) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    // Check permissions
    if (workspace.ownerId !== updaterId && 
        (!updaterMember || updaterMember.role !== WorkspaceRole.ADMIN)) {
      throw new ForbiddenException('Only workspace owners and admins can update user roles');
    }

    // Cannot change workspace owner role
    if (workspace.ownerId === memberUserId) {
      throw new ForbiddenException('Cannot change workspace owner role');
    }

    // In a real implementation, this would use a command
    const updatedMember: WorkspaceMember = {
      ...targetMember,
      role: newRole,
    };

    this.logger.log(`User role updated successfully`);
    return updatedMember;
  }

  async getWorkspaceStats(workspaceId: string, userId: string): Promise<WorkspaceStats> {
    // Verify user has access to workspace
    await this.getWorkspace(workspaceId, userId);

    // In a real implementation, this would aggregate data from various services
    const stats: WorkspaceStats = {
      totalMembers: 1,
      totalWorkflows: 0,
      totalExecutions: 0,
      monthlyExecutions: 0,
      storageUsed: 0,
    };

    return stats;
  }

  private async sendInvitationEmail(
    invitation: WorkspaceInvitation, 
    workspace: Workspace, 
    message?: string
  ): Promise<void> {
    // In a real implementation, this would send an email using a notification service
    this.logger.log(`Sending invitation email to: ${invitation.email}`);
    
    // Email would contain:
    // - Workspace name
    // - Inviter information
    // - Role being assigned
    // - Invitation link with token
    // - Custom message if provided
    // - Expiration date
  }
}
