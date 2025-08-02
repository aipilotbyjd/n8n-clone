import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PasswordPolicy, MfaSetupDto, AuthResponseDto, User } from '@n8n-clone/shared/types';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  workspaceId?: string;
  sessionId?: string;
  type: 'access' | 'refresh' | 'mfa';
  iat?: number;
  exp?: number;
}

export interface LoginResult extends AuthResponseDto {}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: 'refresh';
}

@Injectable()
export class JwtAuthService {
  private readonly defaultPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5,
    maxAge: 90,
    lockoutAttempts: 5,
    lockoutDuration: 30,
  };

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const sessionId = uuidv4();
    
    const accessPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
      sessionId,
      type: 'access',
    };

    const refreshPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      sub: user.id,
      sessionId,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken, sessionId };
  }

  async generateMfaToken(userId: string): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: userId,
      email: '',
      role: '',
      type: 'mfa',
    };

    return this.jwtService.sign(payload, { expiresIn: '10m' });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken);
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // In a real implementation, you would:
      // 1. Check if the session is still valid
      // 2. Get the user from the database
      // 3. Generate new tokens
      
      // For now, we'll create a mock response
      const newSessionId = uuidv4();
      
      const accessPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        sub: payload.sub,
        email: '', // Would be fetched from DB
        role: '', // Would be fetched from DB
        sessionId: newSessionId,
        type: 'access',
      };

      const newRefreshPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
        sub: payload.sub,
        sessionId: newSessionId,
        type: 'refresh',
      };

      const newAccessToken = this.jwtService.sign(accessPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newRefreshPayload, { expiresIn: '7d' });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  validatePasswordPolicy(password: string, policy: PasswordPolicy = this.defaultPasswordPolicy): string[] {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (password.length > policy.maxLength) {
      errors.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  }

  // Multi-Factor Authentication Methods
  async generateMfaSecret(userEmail: string): Promise<MfaSetupDto> {
    const secret = speakeasy.generateSecret({
      name: `N8N Clone (${userEmail})`,
      issuer: 'N8N Clone',
      length: 32,
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);
    
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  async verifyMfaCode(code: string, secret: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before and after current time
    });
  }

  async verifyBackupCode(code: string, backupCodes: string[]): Promise<boolean> {
    return backupCodes.includes(code.toUpperCase());
  }

  generatePasswordResetToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'password_reset',
    };

    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  async verifyPasswordResetToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      return { userId: payload.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  generateInvitationToken(workspaceId: string, email: string, role: string): string {
    const payload = {
      workspaceId,
      email,
      role,
      type: 'invitation',
    };

    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async verifyInvitationToken(token: string): Promise<{ workspaceId: string; email: string; role: string }> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'invitation') {
        throw new UnauthorizedException('Invalid token type');
      }

      return {
        workspaceId: payload.workspaceId,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired invitation token');
    }
  }
}
