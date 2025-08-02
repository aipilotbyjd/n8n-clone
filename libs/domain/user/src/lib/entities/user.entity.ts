import { AggregateRoot } from '@n8n-clone/domain/core';
import { UserRole } from '@n8n-clone/shared/types';

export class UserEntity extends AggregateRoot {
  private _email: string;
  private _firstName: string;
  private _lastName: string;
  private _hashedPassword: string;
  private _isActive: boolean;
  private _role: UserRole;

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    hashedPassword: string,
    role: UserRole = UserRole.VIEWER,
    isActive = true,
  ) {
    super(id);
    this._email = email;
    this._firstName = firstName;
    this._lastName = lastName;
    this._hashedPassword = hashedPassword;
    this._role = role;
    this._isActive = isActive;
  }

  // Getters
  get email(): string {
    return this._email;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get hashedPassword(): string {
    return this._hashedPassword;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get role(): UserRole {
    return this._role;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  // Business methods
  updateProfile(firstName: string, lastName: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this.touch();
  }

  changePassword(newHashedPassword: string): void {
    this._hashedPassword = newHashedPassword;
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  changeRole(newRole: UserRole): void {
    this._role = newRole;
    this.touch();
  }

  toJSON() {
    return {
      id: this.id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      role: this._role,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
