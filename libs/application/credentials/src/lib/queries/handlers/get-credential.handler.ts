import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetCredentialQuery } from '../get-credential.query';
import { Credential } from '@n8n-clone/domain/credentials';
import { ICredentialRepository } from '@n8n-clone/domain/credentials';

@Injectable()
@QueryHandler(GetCredentialQuery)
export class GetCredentialHandler implements IQueryHandler<GetCredentialQuery> {
  constructor(private readonly credentialRepository: ICredentialRepository) {}

  async execute(query: GetCredentialQuery): Promise<Credential | null> {
    return this.credentialRepository.findById(query.id);
  }
}
