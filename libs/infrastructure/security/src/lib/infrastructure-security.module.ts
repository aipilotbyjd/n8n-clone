import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthService } from './services/jwt-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [JwtAuthService, JwtStrategy, AuthGuard],
  exports: [JwtAuthService, AuthGuard, JwtModule, PassportModule],
})
export class InfrastructureSecurityModule {}
