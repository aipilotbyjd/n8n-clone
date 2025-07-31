export class Email {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const normalizedEmail = value.trim().toLowerCase();
    
    if (!this.isValidEmail(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    this._value = normalizedEmail;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }

  equals(other: Email | string): boolean {
    if (typeof other === 'string') {
      return this._value === other.toLowerCase();
    }
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  // Business methods
  isFromDomain(domain: string): boolean {
    return this.domain === domain.toLowerCase();
  }

  isCorporateEmail(): boolean {
    const commonPersonalDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'aol.com',
      'icloud.com',
      'protonmail.com'
    ];

    return !commonPersonalDomains.includes(this.domain);
  }

  // Static factory methods
  static fromString(value: string): Email {
    return new Email(value);
  }

  static isValid(email: string): boolean {
    try {
      new Email(email);
      return true;
    } catch {
      return false;
    }
  }
}
