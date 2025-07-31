import { User } from '../entities/user.entity';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { UserRole } from '../value-objects/user-role.vo';
import { UserStatus } from '../value-objects/user-status.vo';

export interface UserQueryOptions {
  role?: UserRole;
  status?: UserStatus;
  workspaceId?: string;
  searchTerm?: string; // Search in name, email
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'email' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface UserSummary {
  id: UserId;
  email: Email;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Find user by API key hash
   */
  findByApiKey(apiKeyHash: string): Promise<User | null>;

  /**
   * Save user
   */
  save(user: User): Promise<void>;

  /**
   * Delete user
   */
  delete(id: UserId): Promise<void>;

  /**
   * Find users with query options
   */
  findMany(options: UserQueryOptions): Promise<User[]>;

  /**
   * Find user summaries (lightweight version)
   */
  findSummaries(options: UserQueryOptions): Promise<UserSummary[]>;

  /**
   * Count users matching query
   */
  count(options: UserQueryOptions): Promise<number>;

  /**
   * Find users in workspace
   */
  findByWorkspace(workspaceId: string): Promise<User[]>;

  /**
   * Find users by role
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Find users by status
   */
  findByStatus(status: UserStatus): Promise<User[]>;

  /**
   * Check if email exists
   */
  emailExists(email: Email): Promise<boolean>;

  /**
   * Find inactive users older than specified days
   */
  findInactiveUsers(days: number): Promise<User[]>;

  /**
   * Get user statistics
   */
  getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    usersByRole: Record<UserRole, number>;
    recentSignups: number; // Last 30 days
  }>;

  /**
   * Update user status
   */
  updateStatus(id: UserId, status: UserStatus): Promise<void>;

  /**
   * Update last login time
   */
  updateLastLogin(id: UserId): Promise<void>;

  /**
   * Verify email
   */
  verifyEmail(id: UserId): Promise<void>;
}
