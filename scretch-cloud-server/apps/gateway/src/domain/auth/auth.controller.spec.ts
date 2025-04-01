import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request, response } from 'express'
import { JwtGuard } from '@guards/jwt.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: AuthService,
        useValue: {
          login: jest.fn().mockReturnValue({
            access: "accessToken"
          }),
          register: jest.fn().mockReturnValue({
            access: "accessToken"
          }),
          refresh: jest.fn().mockReturnValue({
            access: "accessToken"
          }),
          getMe: jest.fn().mockResolvedValue({ userId: 1, username: "John Doe" })
        }
      }],
    }).overrideGuard(JwtGuard).useValue({
      canActivate: (ctx: ExecutionContext) => {
          const request = ctx.switchToHttp().getRequest<Request>()

          request.user = {
              id: 1
          }
          request.cookies = {
              "refreshToken": "superToken"
          }

          return true
      }
  }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it(`Register new user`, async () => {
    expect(await controller.register({ username: "John Doe", password: "secretPassword" }, response)).toStrictEqual({ access: "accessToken" })
  })

  it(`Login user`, async () => {
    expect(await controller.login({ username: "John Doe", password: "secretPassword" }, response)).toStrictEqual({ access: "accessToken" })
  })

  it(`Refresh tokens`, async () => {
    expect(await controller.refresh(`refreshToken`, response)).toStrictEqual({ access: "accessToken" })
  })

  it(`Get user data`, async () => {
    expect(await controller.getMe(1)).toStrictEqual({ userId: 1, username: "John Doe" })
  })
});
