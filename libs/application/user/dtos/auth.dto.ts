import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserResponseDto } from './create-user.dto';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
