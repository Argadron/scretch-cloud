import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { response } from 'express'
import { hash } from 'bcrypt'
import { Prisma } from '@prisma/client';
import { UserService } from '../user/user.service';
import { AppConfigModule } from '@app/app-config';
import { Observable } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [AuthService, {
        provide: UserService,
        useValue: {
          getBy: jest.fn().mockImplementation(async (args: Prisma.UserAggregateArgs) => {
            if (args.where?.username === `Indian Doe`) return null 
            else {
              return { userId: 1, username: "John Doe", password: await hash("strongpassword", 3), profilePhoto: "default.png" }
            }
          }),
          create: jest.fn().mockResolvedValue({ userId: 2, username: "Mark Doe", password: "superpassword", profilePhoto: "default.png" })
        }
      }, {
        provide: JwtService,
        useValue: {
          verifyAsync: jest.fn().mockResolvedValue({ userId: 1 }),
          signAsync: jest.fn().mockResolvedValue(`accessToken`)
        }
      },
      {
        provide: "AUTH_CLIENT",
        useValue: {
          send: jest.fn().mockImplementation((cmdObject: Record<string, string>, data) => {
            switch (cmdObject.cmd) {
              case "register_cmd":
                return new Observable((subscriber) => subscriber.next({ access: `accessToken`, refresh: "accessToken" }))
              case "login_cmd":
                return new Observable((subscriber) => subscriber.next({ access: `accessToken`, refresh: "accessToken" }))
              case "refresh_cmd":
                return new Observable((subscriber) => subscriber.next({ access: `accessToken`, refresh: "accessToken" }))
              case "get_me_cmd":
                return new Observable((subscriber) => subscriber.next({ username: "John Doe" }))
            }
          })
        }
      }
    ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("Register new user", async () => {
    expect(await service.register({ username: "Indian Doe", password: "superpassword" }, response)).toStrictEqual({ access: `accessToken` })
  })

  it(`Login user`, async () => {
    expect(await service.login({ username: "John Doe", password: "strongpassword" }, response)).toStrictEqual({ access: `accessToken` })
  })

  it(`Refresh tokens`, async () => {
    expect(await service.refresh("token", response)).toStrictEqual({ access: `accessToken` })
  })

  it(`Get user data`, async () => {
    expect(await service.getMe(1)).toHaveProperty(`username`, `John Doe`)
  })
});
