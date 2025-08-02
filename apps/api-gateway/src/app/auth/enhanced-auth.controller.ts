import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Headers,
  Ip,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { 
  LoginDto, 
  AuthResponseDto, 
  CreateUserDto, 
  ChangePasswordDto, 
  ResetPasswordDto,
  MfaSetupDto,
  VerifyMfaDto,
  User,
  UserActivityLog
} from '@n8n-clone/shared/types';
import { 
  JwtAuthService, 
  AuthGuard,
  Public,
  CurrentUser,
  RateLimitStrict,
  RateLimitModerate,
  AuditUserAction,
  RequireFreshSession
} from '@n8n-clone/infrastructure/security';
import { UsersService } from '../../user-management/src/app/users/users.service';

@ApiTags('Authentication')
@Controller('auth')
export class EnhancedAuthController {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly usersService: UsersService
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RateLimitModerate()
  @AuditUserAction('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  async register(
    @Body() dto: CreateUserDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<AuthResponseDto> {
    // Validate password policy
    const passwordErrors = this.jwtAuthService.validatePasswordPolicy(dto.password);
    if (passwordErrors.length > 0) {
      throw new BadRequestException({ 
        message: 'Password does not meet policy requirements',
        errors: passwordErrors
      });
    }

    // Check if user already exists
    const existingUser = await this.usersService.getUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    // Hash password and create user
    const hashedPassword = await this.jwtAuthService.hashPassword(dto.password);
    const userData = {
      ...dto,
      password: hashedPassword,
    };

    const user = await this.usersService.createUser(userData);
    
    // Generate tokens
    const { accessToken, refreshToken } = await this.jwtAuthService.generateTokens(user);

    // Log registration activity
    await this.logUserActivity({
      userId: user.id,
      action: 'register',
      resource: 'user',
      details: { email: user.email },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimitStrict()
  @AuditUserAction('login')
  @ApiOperation({ summary: 'Authenticate user and return tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 423, description: 'Account locked' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.getUserByEmail(dto.email);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.security.lockedUntil && user.security.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked due to too many failed login attempts');
    }

    // Verify password
    const isPasswordValid = await this.jwtAuthService.comparePassword(
      dto.password, 
      user.hashedPassword
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if MFA is enabled
    if (user.security.mfaEnabled && !dto.mfaCode) {
      // Generate MFA token for next step
      const mfaToken = await this.jwtAuthService.generateMfaToken(user.id);
      
      return {
        user: null as any,
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        requiresMfa: true,
        mfaToken,
      };
    }

    // Verify MFA code if provided
    if (user.security.mfaEnabled && dto.mfaCode) {
      const isMfaValid = await this.verifyMfaCode(dto.mfaCode, user);
      if (!isMfaValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    // Reset failed login attempts on successful login
    await this.resetFailedLoginAttempts(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await this.jwtAuthService.generateTokens(user);

    // Update last login timestamp
    await this.updateLastLogin(user.id);

    // Log login activity
    await this.logUserActivity({
      userId: user.id,
      action: 'login',
      resource: 'user',
      details: { 
        email: user.email,
        mfaUsed: user.security.mfaEnabled 
      },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @RateLimitModerate()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(
    @Body('refreshToken') refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    return await this.jwtAuthService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @AuditUserAction('logout')
  @ApiOperation({ summary: 'Logout user and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @CurrentUser() user: User,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<{ message: string }> {
    // In a real implementation, this would:
    // 1. Add the token to a blacklist
    // 2. Clear any session data
    // 3. Log the logout activity

    await this.logUserActivity({
      userId: user.id,
      action: 'logout',
      resource: 'user',
      details: {},
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return { message: 'Logout successful' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @RequireFreshSession(300) // Require recent authentication within 5 minutes
  @AuditUserAction('change_password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password or password policy violation' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: User,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<{ message: string }> {
    // Verify current password
    const isCurrentPasswordValid = await this.jwtAuthService.comparePassword(
      dto.currentPassword,
      user.hashedPassword
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    // Check password policy
    const passwordErrors = this.jwtAuthService.validatePasswordPolicy(dto.newPassword);
    if (passwordErrors.length > 0) {
      throw new BadRequestException({
        message: 'New password does not meet policy requirements',
        errors: passwordErrors
      });
    }

    // Hash new password
    const hashedNewPassword = await this.jwtAuthService.hashPassword(dto.newPassword);

    // Update password
    await this.usersService.changePassword(user.id, dto.currentPassword, dto.newPassword);

    // Log password change
    await this.logUserActivity({
      userId: user.id,
      action: 'change_password',
      resource: 'user',
      details: {},
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return { message: 'Password changed successfully' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @RateLimitStrict()
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(
    @Body('email') email: string,
    @Ip() ipAddress: string
  ): Promise<{ message: string }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Always return success to prevent email enumeration
    // In a real implementation, this would send an email if the user exists
    await this.usersService.resetPassword(email);

    return { message: 'If an account with this email exists, a reset link has been sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @RateLimitStrict()
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<{ message: string }> {
    // Verify reset token
    const { userId } = await this.jwtAuthService.verifyPasswordResetToken(dto.token);

    // Validate new password
    const passwordErrors = this.jwtAuthService.validatePasswordPolicy(dto.newPassword);
    if (passwordErrors.length > 0) {
      throw new BadRequestException({
        message: 'Password does not meet policy requirements',
        errors: passwordErrors
      });
    }

    // Hash new password
    const hashedPassword = await this.jwtAuthService.hashPassword(dto.newPassword);

    // Update password (this would use a command in real implementation)
    // await this.usersService.updatePassword(userId, hashedPassword);

    // Log password reset
    await this.logUserActivity({
      userId,
      action: 'reset_password',
      resource: 'user',
      details: {},
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return { message: 'Password reset successfully' };
  }

  @Get('mfa/setup')
  @UseGuards(AuthGuard)
  @RequireFreshSession(300)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup multi-factor authentication' })
  @ApiResponse({ status: 200, description: 'MFA setup data generated' })
  async setupMfa(@CurrentUser() user: User): Promise<MfaSetupDto> {
    if (user.security.mfaEnabled) {
      throw new ConflictException('MFA is already enabled for this account');
    }

    return await this.jwtAuthService.generateMfaSecret(user.email);
  }

  @Post('mfa/enable')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @RequireFreshSession(300)
  @AuditUserAction('enable_mfa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable multi-factor authentication' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid MFA code' })
  async enableMfa(
    @Body() dto: VerifyMfaDto,
    @CurrentUser() user: User,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<{ message: string; backupCodes: string[] }> {
    if (user.security.mfaEnabled) {
      throw new ConflictException('MFA is already enabled for this account');
    }

    // This would typically get the secret from a temporary storage
    // For now, we'll generate a new secret for verification
    const mfaSetup = await this.jwtAuthService.generateMfaSecret(user.email);
    
    const isValidCode = await this.jwtAuthService.verifyMfaCode(dto.code, mfaSetup.secret);
    if (!isValidCode) {
      throw new BadRequestException('Invalid MFA code');
    }

    // Enable MFA for user (this would use a command in real implementation)
    // await this.usersService.enableMfa(user.id, mfaSetup.secret, mfaSetup.backupCodes);

    // Log MFA enablement
    await this.logUserActivity({
      userId: user.id,
      action: 'enable_mfa',
      resource: 'user',
      details: {},
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return {
      message: 'MFA enabled successfully',
      backupCodes: mfaSetup.backupCodes
    };
  }

  @Post('mfa/disable')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @RequireFreshSession(300)
  @AuditUserAction('disable_mfa')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable multi-factor authentication' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  async disableMfa(
    @Body() dto: VerifyMfaDto,
    @CurrentUser() user: User,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<{ message: string }> {
    if (!user.security.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled for this account');
    }

    const isValidCode = await this.verifyMfaCode(dto.code, user);
    if (!isValidCode) {
      throw new BadRequestException('Invalid MFA code');
    }

    // Disable MFA for user (this would use a command in real implementation)
    // await this.usersService.disableMfa(user.id);

    // Log MFA disablement
    await this.logUserActivity({
      userId: user.id,
      action: 'disable_mfa',
      resource: 'user',
      details: {},
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return { message: 'MFA disabled successfully' };
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active user sessions' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved' })
  async getActiveSessions(@CurrentUser() user: User): Promise<any[]> {
    // In a real implementation, this would return active sessions from database/redis
    return [];
  }

  @Post('sessions/:sessionId/revoke')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @AuditUserAction('revoke_session')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(
    @CurrentUser() user: User,
    @Body('sessionId') sessionId: string
  ): Promise<{ message: string }> {
    // In a real implementation, this would revoke the specific session
    return { message: 'Session revoked successfully' };
  }

  private async verifyMfaCode(code: string, user: User): Promise<boolean> {
    if (!user.security.mfaSecret) {
      return false;
    }

    // Try TOTP code first
    const isTotpValid = await this.jwtAuthService.verifyMfaCode(code, user.security.mfaSecret);
    if (isTotpValid) {
      return true;
    }

    // Try backup codes
    if (user.security.backupCodes) {
      const isBackupCodeValid = await this.jwtAuthService.verifyBackupCode(code, user.security.backupCodes);
      if (isBackupCodeValid) {
        // Remove used backup code (this would use a command in real implementation)
        return true;
      }
    }

    return false;
  }

  private async handleFailedLogin(userId: string): Promise<void> {
    // In a real implementation, this would increment failed login attempts
    // and lock the account if threshold is exceeded
  }

  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    // In a real implementation, this would reset failed login attempts counter
  }

  private async updateLastLogin(userId: string): Promise<void> {
    // In a real implementation, this would update the last login timestamp
  }

  private async logUserActivity(activity: Omit<UserActivityLog, 'id'>): Promise<void> {
    // In a real implementation, this would log the activity to database or audit service
    console.log('User Activity:', activity);
  }
}
