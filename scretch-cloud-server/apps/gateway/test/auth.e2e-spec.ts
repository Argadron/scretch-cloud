import { ExecutionContext, INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../src/domain/auth/auth.controller";
import { JwtGuard } from "@guards/jwt.guard";
import { Request } from "express";
import * as request from 'supertest'
import { AuthDto } from "../src/domain/auth/dto/auth.dto";
import { AuthService } from "../src/domain/auth/auth.service";
import * as cookieParser from 'cookie-parser'
import 'dotenv/config'
import { AppConfigModule, AppConfigService } from "@app/app-config";
import { Observable } from "rxjs";

describe(`Auth Controller (E2E)`, () => {
    let app: INestApplication;

    const mockRegisterData: AuthDto = {
        username: "Indian Doe",
        password: "supersecretpassword"
    }
    const mockLoginData: AuthDto = {
        username: "John Doe",
        password: "strongpassword"
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppConfigModule],
            controllers: [AuthController],
            providers: [
                AuthService,
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
            ]
        }).overrideGuard(JwtGuard).useValue({
            canActivate: (ctx: ExecutionContext) => {
                const request = ctx.switchToHttp().getRequest<Request>()
    
                request.user = {
                    id: 1
                }
                request.cookies = {
                    [`${process.env.REFRESH_TOKEN_COOKIE_NAME}`]: "superToken"
                }
    
                return true
            }
        }).compile()

        app = moduleFixture.createNestApplication()

        app.setGlobalPrefix(`/api`)
        app.use(cookieParser())

        await app.init()
    })

    it(`(POST) (/api/auth/register) (Create a new user test)`, () => {
        return request(app.getHttpServer())
        .post(`/api/auth/register`)
        .send(mockRegisterData)
        .expect(201)
    })

    it(`(POST) (/api/auth/login) (Login user test)`, () => {
        return request(app.getHttpServer())
        .post(`/api/auth/login`)
        .send(mockLoginData)
        .expect(200)
    })

    it(`(GET) (/api/auth/refresh) (Refresh tokens test)`, () => {
        const configService = app.get(AppConfigService)

        return request(app.getHttpServer())
        .get(`/api/auth/refresh`)
        .set(`Cookie`, [`${configService.getSwaggerConfig("refresh_token_name")}=token`])
        .withCredentials(true)
        .expect(200)
    })

    it(`(GET) (/api/auth/me) (Get a user profile test)`, () => {
        return request(app.getHttpServer())
        .get(`/api/auth/me`)
        .expect(200)
    })

    afterEach(async () => {
        await app.close()
    })
})