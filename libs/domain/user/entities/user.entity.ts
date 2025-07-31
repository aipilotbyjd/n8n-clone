import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { UserRole } from '../value-objects/user-role.vo';
import { UserStatus } from '../value-objects/user-status.vo';

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone?: string;
  language?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    browser: boolean;
    slack: boolean;
  };
  workflow: {
    autoSave: boolean;
    showNodeDetails: boolean;
    gridSize: number;
  };
}

export class User {
  constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private _passwordHash: string,
    private _profile: UserProfile,
    private _role: UserRole,
    private _status: UserStatus,
    private _preferences: UserPreferences,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private _lastLoginAt?: Date,
    private _emailVerifiedAt?: Date,
    private _workspaceIds: string[] = [],
    private _apiKeyHash?: string,
    private _twoFactorSecret?: string,
    private _twoFactorEnabled: boolean = false
  ) { }

  // Getters
  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get profile(): UserProfile {
    return { ...this._profile };
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  get preferences(): UserPreferences {
    return JSON.parse(JSON.stringify(this._preferences));
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  get emailVerifiedAt(): Date | undefined {
    return this._emailVerifiedAt;
  }

  get workspaceIds(): string[] {
    return [...this._workspaceIds];
  }

  get apiKeyHash(): string | undefined {
    return this._apiKeyHash;
  }

  get twoFactorEnabled(): boolean {
    return this._twoFactorEnabled;
  }

  get fullName(): string {
    return `${this._profile.firstName} ${this._profile.lastName}`.trim();
  }

  get isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  get isEmailVerified(): boolean {
    return this._emailVerifiedAt !== undefined;
  }

  get canLogin(): boolean {
    return this.isActive && this.isEmailVerified;
  }

  // Business methods
  updateProfile(profile: Partial<UserProfile>): User {
    const updatedProfile = { ...this._profile, ...profile };

    return new User(
      this._id,
      this._email,
      this._passwordHash,
      updatedProfile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  updatePreferences(preferences: Partial<UserPreferences>): User {
    const updatedPreferences = { ...this._preferences, ...preferences };

    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      updatedPreferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  changePassword(newPasswordHash: string): User {
    return new User(
      this._id,
      this._email,
      newPasswordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  changeRole(role: UserRole): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  activate(): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      UserStatus.ACTIVE,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  deactivate(): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      UserStatus.INACTIVE,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  suspend(): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      UserStatus.SUSPENDED,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  verifyEmail(): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      new Date(),
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  recordLogin(): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      new Date(),
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  addToWorkspace(workspaceId: string): User {
    if (this._workspaceIds.includes(workspaceId)) {
      return this;
    }

    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      [...this._workspaceIds, workspaceId],
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  removeFromWorkspace(workspaceId: string): User {
    const updatedWorkspaceIds = this._workspaceIds.filter(id => id !== workspaceId);

    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      updatedWorkspaceIds,
      this._apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  setApiKey(apiKeyHash: string): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      apiKeyHash,
      this._twoFactorSecret,
      this._twoFactorEnabled
    );
  }

  enableTwoFactor(secret: string): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      secret,
      true
    );
  }

  disableTwoFactor(): User {
    return new User(
      this._id,
      this._email,
      this._passwordHash,
      this._profile,
      this._role,
      this._status,
      this._preferences,
      this._createdAt,
      new Date(),
      this._lastLoginAt,
      this._emailVerifiedAt,
      this._workspaceIds,
      this._apiKeyHash,
      undefined,
      false
    );
  }

  // Static factory methods
  static create(
    email: Email,
    passwordHash: string,
    profile: UserProfile,
    role: UserRole = UserRole.USER
  ): User {
    return new User(
      UserId.generate(),
      email,
      passwordHash,
      profile,
      role,
      UserStatus.INACTIVE,
      User.getDefaultPreferences(),
      new Date(),
      new Date()
    );
  }

  static getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      notifications: {
        email: true,
        browser: true,
        slack: false
      },
      workflow: {
        autoSave: true,
        showNodeDetails: true,
        gridSize: 20
      }
    };
  }
}
