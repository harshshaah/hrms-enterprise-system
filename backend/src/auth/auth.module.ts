import {
  Module,
} from '@nestjs/common';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  PassportModule,
} from '@nestjs/passport';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  UserModule,
} from '../user/user.module';

import {
  OrganizationModule,
} from '../organization/organization.module';

import {
  AuthController,
} from './auth.controller';

import {
  AuthService,
} from './auth.service';

import {
  JwtStrategy,
} from './strategies/jwt.strategy';

import {
  RolesGuard,
} from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule,

    UserModule,
    OrganizationModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => {
        const secret =
          configService.get<string>(
            'JWT_SECRET',
          );

        if (!secret) {
          throw new Error(
            'JWT_SECRET is not configured',
          );
        }

        return {
          secret,

          signOptions: {
            expiresIn: '1d' as any,
          },
        };
      },
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
  ],

  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    RolesGuard,
  ],
})
export class AuthModule {}