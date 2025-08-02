export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public touch(): void {
    this.updatedAt = new Date();
  }
}

export abstract class AggregateRoot extends BaseEntity {
  private _domainEvents: any[] = [];

  constructor(id: string) {
    super(id);
  }

  public addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  public getDomainEvents(): any[] {
    return this._domainEvents;
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
