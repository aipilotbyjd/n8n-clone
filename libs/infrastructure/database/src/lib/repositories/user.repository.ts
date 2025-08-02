import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSchema } from '../schemas/user.schema';
import { UserEntity, IUserRepository } from '@n8n-clone/domain/user';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly userRepository: Repository<UserSchema>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userRepository.find();
    return users.map(user => this.toDomain(user));
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const userSchema = this.toSchema(user);
    const savedUser = await this.userRepository.save(userSchema);
    return this.toDomain(savedUser);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  private toDomain(schema: UserSchema): UserEntity {
    return new UserEntity(
      schema.id,
      schema.email,
      schema.firstName,
      schema.lastName,
      schema.hashedPassword,
      schema.role,
      schema.isActive,
    );
  }

  private toSchema(entity: UserEntity): UserSchema {
    const schema = new UserSchema();
    schema.id = entity.id;
    schema.email = entity.email;
    schema.firstName = entity.firstName;
    schema.lastName = entity.lastName;
    schema.hashedPassword = entity.hashedPassword;
    schema.role = entity.role;
    schema.isActive = entity.isActive;
    return schema;
  }
}
