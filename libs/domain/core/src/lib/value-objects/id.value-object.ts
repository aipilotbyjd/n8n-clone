import { v4 as uuidv4 } from 'uuid';

export class Id {
  private readonly value: string;

  constructor(value?: string) {
    this.value = value || uuidv4();
    this.validate();
  }

  private validate(): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.value)) {
      throw new Error('Invalid UUID format');
    }
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Id): boolean {
    return this.value === other.value;
  }

  public static generate(): Id {
    return new Id();
  }
}
