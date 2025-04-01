import { ExecutionContext, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { UserAppController } from '../src/domain/user-app/user-app.controller'
import * as request from 'supertest'
import { UserAppService } from '../src/domain/user-app/user-app.service'
import { Request } from 'express'
import { JwtGuard } from '@guards/jwt.guard'
import { DeveloperGuard } from '@guards/developer.guard'
import { CreateAppDto } from '../src/domain/user-app/dto/create-app.dto'
import { CreateConnectDto } from '../src/domain/user-app/dto/create-connect.dto'
import { UpdateAppDto } from '../src/domain/user-app/dto/update-app.dto'
import { Developer } from '../src/domain/user-app/interfaces'
import { Observable } from 'rxjs'

describe(`UserApp Controller(E2E)`, () => {
    let app: INestApplication
    const mockCreateAppData: CreateAppDto = {
        name: "my-mocked-app"
    }
    const mockUpdateAppData: UpdateAppDto = {
        appId: 1,
        isNeedResetToken: false
    }
    const mockCreateConnectData: CreateConnectDto = {
        appId: 2,
        storageName: "mock-connect storage"
    }
    const mockDeveloperData: Developer = {
        applicationId: 1,
        userId: 1
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UserAppController],
            providers: [
                UserAppService,
                {
                    provide: "USER_APP_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObject: Record<string, string>, data) => {
                            switch (cmdObject.cmd) {
                                case "get_all_apps_cmd":
                                    return new Observable((subscriber) => subscriber.next([{ id: 1, name: "mock-app" }]))
                                case "create_app_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, secretKey: "mock-secret-key" }))
                                case "update_app_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, name: "mock-editted-app" }))
                                case "create_connect_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, name: "mock-editted-app" }))
                                case "get_file_cmd":
                                    return {
                                        subscribe: jest.fn()
                                    }
                                case "upload_file_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, fileOriginalName: "mock-file.txt" }))
                            }
                        }),
                        emit: jest.fn().mockImplementation((eventObj: Record<string, string>, data) => new Observable((subscriber) => subscriber.next(undefined)))
                    }
                }
            ]
        }).overrideGuard(JwtGuard).useValue({
            canActivate: (ctx: ExecutionContext) => {
                const request = ctx.switchToHttp().getRequest<Request>()

                request.user = {
                    id: 1
                }

                return true
            }
        }).overrideGuard(DeveloperGuard).useValue({
            canActivate: (ctx: ExecutionContext) => {
                const request = ctx.switchToHttp().getRequest<Request>()

                request.user = {
                    userId: 1,
                    applicationId: 1
                }

                return true
            }
        }).compile()

        app = moduleFixture.createNestApplication()

        app.setGlobalPrefix(`/api`)

        await app.init()
    })

    it(`(GET) (/api/application/all) (Get all user apps test)`, () => {
        return request(app.getHttpServer())
        .get(`/api/application/all`)
        .expect(200)
    })

    it(`(POST) (/api/application/create) (Create a new user application test)`, () => {
        return request(app.getHttpServer())
        .post(`/api/application/create`)
        .send(mockCreateAppData)
        .expect(201)
    })

    it(`(PUT) (/api/application/update) (Update user application test)`, () => {
        return request(app.getHttpServer())
        .put(`/api/application/update`)
        .send(mockUpdateAppData)
        .expect(200)
    })

    it(`(DELETE) (/api/application/delete/:id) (Delete user application test)`, () => {
        return request(app.getHttpServer())
        .delete(`/api/application/delete/1`)
        .expect(204)
    })

    it(`(POST) (/api/application/createConnect) (Create connect between application and storage test)`, () => {
        return request(app.getHttpServer())
        .post(`/api/application/createConnect`)
        .send(mockCreateConnectData)
        .expect(200)
    })

    it(`(DELETE) (/api/application/disconnectStorage/:id) (Disconnect storage from app test)`, () => {
        return request(app.getHttpServer())
        .delete(`/api/application/disconnectStorage/1`)
        .expect(204)
    })

    it(`(POST) (/api/application/uploadFile) (Upload file by API-KEY to storage test)`, () => {
        return request(app.getHttpServer())
        .post(`/api/application/uploadFile`)
        .expect(200)
    })

    it(`(DELETE) (/api/application/deleteFile/:name)`, () => {
        return request(app.getHttpServer())
        .delete(`/api/application/deleteFile/mock-file`)
        .expect(204)
    })

    afterEach(async () => {
        await app.close()
    })
})