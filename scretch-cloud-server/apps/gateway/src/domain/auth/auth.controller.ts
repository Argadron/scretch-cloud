import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';
import { Token } from '@decorators/token.decorator';
import { Auth } from '@decorators/auth.decorator';
import { CurrentUser } from '@decorators/user.decorator';

@Controller('auth')
@ApiTags(`Auth Controller`)
export class AuthController {
  public constructor(
    private readonly authService: AuthService
  ) {}

  @ApiOperation({ summary: "Register a new user" })
  @ApiConflictResponse({ description: "User with this username already exsists!" })
  @ApiCreatedResponse({ description: "User successfly created" })
  @Post(`/register`)
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return await this.authService.register(dto, res)
  }

  @ApiOperation({ summary: "Login user method" })
  @ApiBadRequestResponse({ description: "Bad password or username provided" })
  @ApiOkResponse({ description: "User sucessfly logined" })
  @Post(`/login`)
  @HttpCode(HttpStatus.OK)
  public async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return await this.authService.login(dto, res)
  }

  @ApiOperation({ summary: "Refresh tokens method" })
  @ApiUnauthorizedResponse({ description: "Refresh token invalid / Not provided" })
  @ApiOkResponse({ description: "Success token refresh" })
  @ApiCookieAuth()
  @Get(`/refresh`)
  @HttpCode(HttpStatus.OK)
  public async refresh(@Token() token: string, @Res({ passthrough: true }) res: Response) {
    return await this.authService.refresh(token, res)
  }

  @ApiOperation({ summary: "Get user profile" })
  @ApiUnauthorizedResponse({ description: "No access token / Token invalid" })
  @ApiOkResponse({ description: "Profile getted" })
  @ApiBearerAuth()
  @Auth()
  @Get(`/me`)
  @HttpCode(HttpStatus.OK)
  public async getMe(@CurrentUser(`id`) userId: number) {
    return await this.authService.getMe(userId)
  }
}
