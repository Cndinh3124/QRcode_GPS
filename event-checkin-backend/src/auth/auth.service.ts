import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

import type { StringValue } from 'ms';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,
  ) {}

  async login(
    loginDto: LoginDto,
  ) {
    const user =
      await this.usersService.findByEmail(
        loginDto.email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không đúng',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tài khoản đã bị vô hiệu hóa',
      );
    }

    const isMatch =
      await bcrypt.compare(
        loginDto.password,
        user.password,
      );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không đúng',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const secret =
      this.configService.get<string>(
        'JWT_SECRET',
      );

    if (!secret) {
      throw new Error(
        'JWT_SECRET is not configured',
      );
    }

    const expiresIn =
      this.configService.get<string>(
        'JWT_EXPIRES',
      ) as StringValue;

    const access_token =
      await this.jwtService.signAsync(
        payload,
        {
          secret,
          expiresIn,
        },
      );

    return {
      access_token,

      user: {
        id: user.id,
        studentCode:
          user.studentCode,
        fullName:
          user.fullName,
        email:
          user.email,
        role: user.role.name,
      },
    };
  }
}