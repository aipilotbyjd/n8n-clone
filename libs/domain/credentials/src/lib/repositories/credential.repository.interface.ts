import { Credential } from '../entities/credential.entity';

export interface ICredentialRepository {
  findById(id: string): Promise<Credential | null>;
  findByUserId(userId: string): Promise<Credential[]>;
  findByUserIdAndName(userId: string, name: string): Promise<Credential | null>;
  save(credential: Credential): Promise<Credential>;
  delete(id: string): Promise<void>;
}
