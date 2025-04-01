import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { AppConfigModule } from "@app/app-config";
import { Observable } from "rxjs";
import { hashSync } from 'bcrypt'

describe(`Auth Service`, () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppConfigModule],
            providers: [AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn().mockResolvedValue({ userId: 1 }),
                        signAsync: jest.fn().mockResolvedValue(`accessToken`)
                    }
                },
                {
                    provide: "USER_CLIENT",
                    useValue: {
                            send: jest.fn().mockImplementation((cmdObj: Record<string, string>, data) => {
                              switch (cmdObj.cmd) {
                                case "find_user_cmd":
                                  if (data.where.username === "Indian Doe") return new Observable((subscriber) => subscriber.next(null))
                                  else return new Observable((subscriber) => subscriber.next({ userId: 1, username: "John Doe", password: hashSync("strongpassword", 3), profilePhoto: "default.png" }))
                                case "create_user_cmd":
                                  return new Observable((subscriber) => subscriber.next({ userId: 2, username: "Mark Doe", password: "superpassword", profilePhoto: "default.png" }))
                              }
                            })
                    }
                }
            ]
        }).compile()

        service = module.get<AuthService>(AuthService)
    })

    it("Register new user", async () => {
        expect(await service.register({ username: "Indian Doe", password: "superpassword" })).toStrictEqual({ access: `accessToken`, refresh: "accessToken" })
      })
    
      it(`Login user`, async () => {
        expect(await service.login({ username: "John Doe", password: "strongpassword" })).toStrictEqual({ access: `accessToken`, refresh: "accessToken" })
      })
    
      it(`Refresh tokens`, async () => {
        expect(await service.refresh("token")).toStrictEqual({ access: `accessToken`, refresh: "accessToken" })
      })
    
      it(`Get user data`, async () => {
        expect(await service.getMe(1)).toHaveProperty(`username`, `John Doe`)
      })
})