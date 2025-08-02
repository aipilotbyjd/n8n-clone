import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSuccessResponse, ApiErrorResponse } from '@n8n-clone/shared/common';
import { CreateUserCommand, LoginCommand } from '@n8n-clone/application/user';
import { UserRole } from '@n8n-clone/shared/types';
import { Public } from '@n8n-clone/infrastructure/security';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @Public()
  @ApiSuccessResponse('User registered successfully')
  @ApiErrorResponse(400, 'Bad Request')
  @ApiErrorResponse(409, 'User already exists')
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`Registering user: ${dto.email}`);

    try {
      const userId = await this.commandBus.execute(
        new CreateUserCommand(
          dto.email,
          dto.password,
          dto.firstName,
          dto.lastName,
          dto.role || UserRole.USER,
        ),
      );

      return {
        success: true,
        message: 'User registered successfully',
        data: { id: userId },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to register user:', error);
      throw error;
    }
  }

  @Post('login')
  @Public()
  @ApiSuccessResponse('User logged in successfully')
  @ApiErrorResponse(401, 'Invalid credentials')
  async login(@Body() dto: LoginDto) {
    this.logger.log(`User login attempt: ${dto.email}`);

    try {
      const loginResult = await this.commandBus.execute(
        new LoginCommand(dto.email, dto.password),
      );

      return {
        success: true,
        message: 'User logged in successfully',
        data: loginResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to login user:', error);
      throw error;
    }
  }
}
