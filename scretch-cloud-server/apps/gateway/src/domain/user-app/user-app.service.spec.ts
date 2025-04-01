import { Test, TestingModule } from "@nestjs/testing"
import { UserAppService } from "./user-app.service"
import { PrismaService } from "../../core/prisma/prisma.service"
import { AccountTypeEnum, Prisma, StorageTypesEnum } from "@prisma/client"
import { FileService } from "../file/file.service"
import { CreateAppDto } from "./dto/create-app.dto"
import { CreateConnectDto } from "./dto/create-connect.dto"
import { UpdateAppDto } from "./dto/update-app.dto"
import { Developer } from "./interfaces"
import { response } from "express"
import { UserService } from "../user/user.service"
import { Observable } from "rxjs"

describe(`UserApp Service`, () => {
    let service: UserAppService
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
        const module: TestingModule = await Test.createTestingModule({
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
        }).compile()

        service = module.get<UserAppService>(UserAppService)
    })

    it(`Get all apps test`, async () => {
        expect(await service.getAll(1)).toStrictEqual([{ id: 1, name: "mock-app" }])
    })
    
    it(`Create a application test`, async () => {
       expect(await service.create(mockCreateAppData, 1)).toStrictEqual({ id: 1, secretKey: "mock-secret-key" })
    })

    it(`Update a application test`, async () => {
       expect(await service.update(mockUpdateAppData, 1)).toStrictEqual({ id: 1, name: "mock-editted-app" })
    })

    it(`Delete a application test`, async () => {
       expect(await service.delete(1, 1)).toBeUndefined()
    })

    it(`Create connect between application and storage test`, async () => {
       expect(await service.createConnect(mockCreateConnectData, 1)).toStrictEqual({ id: 1, name: "mock-editted-app" })
    })

    it(`Disconnect storage from applicaton test`, async () => {
       expect(await service.disconnect(1, 1)).toBeUndefined()
    })

    it(`Get file from storage by developer test`, async () => {
       expect(await service.getFile(mockDeveloperData, "mock-file-name", response)).toBeUndefined()
    })

    it(`Uplaod file from developer to storage test`, async () => {
       expect(await service.uploadFile(mockDeveloperData, {} as unknown as Express.Multer.File)).toStrictEqual({ id: 1, fileOriginalName: "mock-file.txt" })
    })

    it(`Delete file from storage by developer test`, async () => {
       expect(await service.deleteFile(mockDeveloperData, `mock-file-name`)).toBeUndefined()
    })
})