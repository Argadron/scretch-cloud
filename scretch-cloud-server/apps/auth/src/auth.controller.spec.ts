import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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
    }).compile();

    controller = app.get<AuthController>(AuthController);
  });

  it(`Register new user`, async () => {
      expect(await controller.register({ username: "John Doe", password: "secretPassword" })).toStrictEqual({ access: "accessToken" })
    })
  
    it(`Login user`, async () => {
      expect(await controller.login({ username: "John Doe", password: "secretPassword" })).toStrictEqual({ access: "accessToken" })
    })
  
    it(`Refresh tokens`, async () => {
      expect(await controller.refresh({ token: "refreshToken" })).toStrictEqual({ access: "accessToken" })
    })
  
    it(`Get user data`, async () => {
      expect(await controller.getMe({ userId: 1 })).toStrictEqual({ userId: 1, username: "John Doe" })
    })
});
