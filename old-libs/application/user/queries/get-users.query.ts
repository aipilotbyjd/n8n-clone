import { IQuery } from '@nestjs/cqrs';

export class GetUsersQuery implements IQuery {
  constructor(
    public readonly limit: number = 50,
    public readonly offset: number = 0,
    public readonly filters?: {
      role?: string;
      status?: string;
      search?: string;
      workspaceId?: string;
    }
  ) {}
}
