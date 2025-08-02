import { IQuery } from '@nestjs/cqrs';

export class GetUsersQuery {
  constructor(
    public readonly limit = 50,
    public readonly offset = 0,
    public readonly filters?: {
      role?: string;
      status?: string;
      search?: string;
      workspaceId?: string;
    }
  ) {}
}
