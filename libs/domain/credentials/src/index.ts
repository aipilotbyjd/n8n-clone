export * from './lib/domain-credentials.module';
export * from './lib/entities/credential.entity';
export * from './lib/repositories/credential.repository.interface';

// Re-export as aliases for compatibility
export { Credential as CredentialEntity } from './lib/entities/credential.entity';
export { ICredentialRepository } from './lib/repositories/credential.repository.interface';
