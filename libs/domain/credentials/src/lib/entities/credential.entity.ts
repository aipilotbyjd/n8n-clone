import { AggregateRoot } from '@n8n-clone/domain/core';

export enum CredentialType {
  API_KEY = 'api-key',
  OAUTH2 = 'oauth2',
  BASIC_AUTH = 'basic-auth',
  JWT = 'jwt',
  CUSTOM = 'custom',
}

export class Credential extends AggregateRoot {
  private _name: string;
  private _type: CredentialType;
  private _encryptedData: string;
  private _userId: string;
  private _isValid: boolean;
  private _testedAt?: Date;

  constructor(
    id: string,
    name: string,
    type: CredentialType,
    encryptedData: string,
    userId: string,
    isValid = false,
    testedAt?: Date,
  ) {
    super(id);
    this._name = name;
    this._type = type;
    this._encryptedData = encryptedData;
    this._userId = userId;
    this._isValid = isValid;
    this._testedAt = testedAt;
    this.validateInvariants();
  }

  get name(): string {
    return this._name;
  }

  get type(): CredentialType {
    return this._type;
  }

  get encryptedData(): string {
    return this._encryptedData;
  }

  get userId(): string {
    return this._userId;
  }

  get isValid(): boolean {
    return this._isValid;
  }

  get testedAt(): Date | undefined {
    return this._testedAt;
  }

  updateData(encryptedData: string): void {
    this._encryptedData = encryptedData;
    this._isValid = false; // Reset validation when data changes
    this._testedAt = undefined;
    this.touch();
  }

  markAsValid(): void {
    this._isValid = true;
    this._testedAt = new Date();
    this.touch();
  }

  markAsInvalid(): void {
    this._isValid = false;
    this._testedAt = new Date();
    this.touch();
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Credential name cannot be empty');
    }
    this._name = newName.trim();
    this.touch();
  }

  private validateInvariants(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Credential name is required');
    }
    
    if (this._name.length > 100) {
      throw new Error('Credential name cannot exceed 100 characters');
    }

    if (!this._encryptedData) {
      throw new Error('Encrypted data is required');
    }

    if (!this._userId) {
      throw new Error('User ID is required');
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      type: this._type,
      userId: this._userId,
      isValid: this._isValid,
      testedAt: this._testedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
