import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginInput } from './inputs/login.input';
import { CreateUserInput } from '../users/inputs /create-user.input';
import { LoginResponse, RefreshResponse } from './response/login.response';
import {ACCESS_DENIED, USER_ALREADY_EXIST, USER_NOT_FOUND, WRONG_PASS} from './constant/auth.constant';
import { UserService } from '../users/user.service';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(userData: CreateUserInput): Promise<LoginResponse> {
    const userExists = await this.usersService.findByEmail(userData.email);
    if (userExists) {
      throw new BadRequestException(USER_ALREADY_EXIST);
    }

    // Hash password
    const hash = await this.hashData(userData.password);
    const newUser = await this.usersService.create({
      ...userData,
      password: hash,
    });
    const { accessToken, refreshToken } = await this.getTokens(
      newUser.id,
      newUser.email,
    );
    await this.updateRefreshToken(newUser.id, refreshToken);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: newUser,
    };
  }

  async signIn(data: LoginInput): Promise<LoginResponse> {
    // Check if user exists
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUND);
    }
    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) {
      throw new UnauthorizedException(WRONG_PASS);
    }
    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
    );
    await this.updateRefreshToken(user.id, refreshToken);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user,
    };
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateById({
      id: userId,
      refreshToken: hashedRefreshToken,
    });
  }

  async hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  async verifyUser(authToken): Promise<UserEntity> {
    const verify = await this.jwtService.verifyAsync(authToken, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
    return verify;
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<RefreshResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException(ACCESS_DENIED);
    }
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException(ACCESS_DENIED);
    }
    const tokens = await this.getTokens(user.id, user.email);
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      id: user.id,
    };
  }

  async getTokens(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '3d',
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
