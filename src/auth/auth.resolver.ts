import { AuthService } from '../auth/auth.service';
import {
  Args,
  Mutation,
  Resolver,
} from '@nestjs/graphql';
import { CreateUserInput } from '../users/inputs /create-user.input';
import { LoginInput } from './inputs/login.input';
import { LoginResponse, RefreshResponse } from './response/login.response';
import { RefreshInput } from './inputs/refresh.input';
import { IsPublic } from '../common/decorators/public.decorator';

@Resolver('auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @IsPublic()
  @Mutation(() => LoginResponse)
  async signup(
    @Args('createUserDto') createUserDto: CreateUserInput,
  ): Promise<LoginResponse> {
    return this.authService.signUp(createUserDto);
  }
  @IsPublic()
  @Mutation(() => LoginResponse)
  async login(@Args('login') login: LoginInput): Promise<LoginResponse> {
    return await this.authService.signIn(login);
  }
  @IsPublic()
  @Mutation(() => RefreshResponse)
  async refreshToken(
    @Args('refresh') tokens: RefreshInput,
  ): Promise<RefreshResponse> {
    return await this.authService.refreshTokens(
      tokens.id,
      tokens.refresh_token,
    );
  }
}
