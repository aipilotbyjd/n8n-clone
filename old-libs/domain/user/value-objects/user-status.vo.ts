export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted'
}

export const USER_STATUS_TRANSITIONS = {
  [UserStatus.PENDING_VERIFICATION]: [UserStatus.ACTIVE, UserStatus.DELETED],
  [UserStatus.INACTIVE]: [UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.DELETED],
  [UserStatus.ACTIVE]: [UserStatus.INACTIVE, UserStatus.SUSPENDED, UserStatus.DELETED],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.DELETED],
  [UserStatus.DELETED]: [] // No transitions from deleted state
};

export class UserStatusValue {
  constructor(private readonly _status: UserStatus) {}

  get value(): UserStatus {
    return this._status;
  }

  // Business methods
  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this._status === UserStatus.INACTIVE;
  }

  isSuspended(): boolean {
    return this._status === UserStatus.SUSPENDED;
  }

  isPendingVerification(): boolean {
    return this._status === UserStatus.PENDING_VERIFICATION;
  }

  isDeleted(): boolean {
    return this._status === UserStatus.DELETED;
  }

  canLogin(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  canTransitionTo(newStatus: UserStatus): boolean {
    const allowedTransitions = USER_STATUS_TRANSITIONS[this._status];
    return allowedTransitions.includes(newStatus);
  }

  getAvailableTransitions(): UserStatus[] {
    return [...USER_STATUS_TRANSITIONS[this._status]];
  }

  equals(other: UserStatus | UserStatusValue): boolean {
    const otherStatus = other instanceof UserStatusValue ? other.value : other;
    return this._status === otherStatus;
  }

  toString(): string {
    return this._status;
  }

  getDisplayName(): string {
    switch (this._status) {
      case UserStatus.ACTIVE:
        return 'Active';
      case UserStatus.INACTIVE:
        return 'Inactive';
      case UserStatus.SUSPENDED:
        return 'Suspended';
      case UserStatus.PENDING_VERIFICATION:
        return 'Pending Verification';
      case UserStatus.DELETED:
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }

  getDescription(): string {
    switch (this._status) {
      case UserStatus.ACTIVE:
        return 'User is active and can access the system';
      case UserStatus.INACTIVE:
        return 'User account is inactive and cannot access the system';
      case UserStatus.SUSPENDED:
        return 'User account is suspended due to policy violations';
      case UserStatus.PENDING_VERIFICATION:
        return 'User account is awaiting email verification';
      case UserStatus.DELETED:
        return 'User account has been deleted';
      default:
        return 'Unknown status';
    }
  }

  // Static methods
  static fromString(status: string): UserStatusValue {
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      throw new Error(`Invalid user status: ${status}`);
    }
    return new UserStatusValue(status as UserStatus);
  }

  static getAvailableStatuses(): UserStatus[] {
    return Object.values(UserStatus);
  }

  static getInitialStatus(): UserStatus {
    return UserStatus.PENDING_VERIFICATION;
  }

  static getActiveStatus(): UserStatus {
    return UserStatus.ACTIVE;
  }
}
