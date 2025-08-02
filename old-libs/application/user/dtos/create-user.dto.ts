import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName!: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  status: string;
  isActive: boolean;
  isEmailVerified: boolean;
  canLogin: boolean;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  workspaceIds: string[];
  preferences: any;
}
