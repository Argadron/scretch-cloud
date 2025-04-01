import { ExecutionContext, INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { StorageController } from "../src/domain/storage/storage.controller";
import { StorageService } from "../src/domain/storage/storage.service";
import { StorageTypesEnum } from "@prisma/client";
import { JwtGuard } from "@guards/jwt.guard";
import { Request } from "express";
import * as request from 'supertest'
import { CreateStorageDto } from "../src/domain/storage/dto/create-storage.dto";
import { UpdateStorageDto } from "../src/domain/storage/dto/update-storage.dto";
import { Observable } from "rxjs";

describe(`Storage Controller (E2E)`, () => {
    let app: INestApplication;
    const mockCreateStorageData: CreateStorageDto = {
        name: "Test storage",
        size: 50,
        type: StorageTypesEnum.DEFAULT
    }
    const mockUpdateStorageData: UpdateStorageDto = {
        name: "My first storage",
        size: 100
    }

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [StorageController],
            providers: [
                StorageService, 
                    {
                    provide: "STORAGE_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObject: Record<string, string>, data) => {
                            switch (cmdObject.cmd) {
                                case "get_by_name_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, name: "Super test storage" }))
                                case "create_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, name: "A new storage" }))
                                case "update_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, name: "A updated storage" }))
                                case "delete_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, name: "A new storage" }))
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

                return true
            }
        }).compile()

        app = moduleFixture.createNestApplication()

        app.setGlobalPrefix(`/api`)

        await app.init()
    })

    it(`(GET) (/api/storage/by-name/:name) (Get details info about one storage test)`, () => {
        return request(app.getHttpServer())
        .get(`/api/storage/by-name/mock`)
        .expect(200)
    })

    it(`(POST) (/api/storage/create) (Create a new storage test)`, () => {
        return request(app.getHttpServer())
        .post(`/api/storage/create`)
        .send(mockCreateStorageData)
        .expect(201)
    })

    it(`(PUT) (/api/storage/update) (Update a storage test)`, () => {
        return request(app.getHttpServer())
        .put(`/api/storage/update`)
        .send(mockUpdateStorageData)
        .expect(200)
    })

    it(`(DELETE) (/api/storage/delete/:name) (Delete a storage test)`, () => {
        return request(app.getHttpServer())
        .delete(`/api/storage/delete/superstorage`)
        .expect(200)
    })

    afterEach(async () => {
        await app.close()
    })
})