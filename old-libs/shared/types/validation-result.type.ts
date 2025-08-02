export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class ValidationResultBuilder {
  private errors: string[] = [];
  private warnings: string[] = [];

  addError(error: string): ValidationResultBuilder {
    this.errors.push(error);
    return this;
  }

  addErrors(errors: string[]): ValidationResultBuilder {
    this.errors.push(...errors);
    return this;
  }

  addWarning(warning: string): ValidationResultBuilder {
    this.warnings.push(warning);
    return this;
  }

  addWarnings(warnings: string[]): ValidationResultBuilder {
    this.warnings.push(...warnings);
    return this;
  }

  build(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    };
  }

  static success(warnings: string[] = []): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings
    };
  }

  static failure(errors: string[], warnings: string[] = []): ValidationResult {
    return {
      isValid: false,
      errors,
      warnings
    };
  }
}
