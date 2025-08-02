import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LoginResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify<JwtPayload>(token);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(user: { id: string; email: string; role: string }): Promise<LoginResult> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.generateToken(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
