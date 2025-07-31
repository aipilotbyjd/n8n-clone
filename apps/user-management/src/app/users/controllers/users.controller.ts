import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  LoginDto,
  UserResponseDto,
  AuthResponseDto,
} from '@n8n-clone/application/user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body(ValidationPipe) dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(dto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @Get()
  async getUsers(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('workspaceId') workspaceId?: string,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    return this.usersService.getUsers(limit, offset, {
      role,
      status,
      search,
      workspaceId,
    });
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) dto: LoginDto): Promise<AuthResponseDto> {
    return this.usersService.authenticateUser(dto);
  }

  @Get('by-email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserResponseDto | null> {
    return this.usersService.getUserByEmail(email);
  }

  @Post(':id/activate')
  async activateUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.activateUser(id);
  }

  @Post(':id/deactivate')
  async deactivateUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.deactivateUser(id);
  }

  @Put(':id/role')
  async changeUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ): Promise<UserResponseDto> {
    return this.usersService.changeUserRole(id, role);
  }

  @Post('auth/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body('email') email: string): Promise<void> {
    return this.usersService.resetPassword(email);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Param('id') id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    return this.usersService.changePassword(id, currentPassword, newPassword);
  }
}
