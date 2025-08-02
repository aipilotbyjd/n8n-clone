import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateCredentialCommand } from '../create-credential.command';
import { Credential, CredentialType } from '@n8n-clone/domain/credentials';
import { ICredentialRepository } from '@n8n-clone/domain/credentials';

@Injectable()
@CommandHandler(CreateCredentialCommand)
export class CreateCredentialHandler implements ICommandHandler<CreateCredentialCommand> {
  constructor(private readonly credentialRepository: ICredentialRepository) {}

  async execute(command: CreateCredentialCommand): Promise<string> {
    const { name, type, data, userId } = command;

    const credential = new Credential(
      Math.random().toString(36).substr(2, 9), // Generate ID
      name,
      type as CredentialType,
      JSON.stringify(data), // Convert data to string
      userId,
    );

    await this.credentialRepository.save(credential);
    return credential.id;
  }
}
