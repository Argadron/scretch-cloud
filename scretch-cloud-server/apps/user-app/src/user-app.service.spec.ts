import { Test, TestingModule } from "@nestjs/testing"
import { UserAppService } from "./user-app.service"
import { DatabaseService } from "@app/database"
import { AccountTypeEnum, Prisma, StorageTypesEnum } from "@prisma/client"
import { Observable } from "rxjs"
import { CreateAppDto } from "./dto/create-app.dto"
import { UpdateAppDto } from "./dto/update-app.dto"
import { CreateConnectDto } from "./dto/create-connect.dto"
import { Developer } from "./interfaces"

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
                    provide: DatabaseService,
                    useValue: {
                         app: {
                             findUnique: jest.fn((args: Prisma.AppAggregateArgs) => {
                                 if (args.where?.id === 2) return { id: 2 }
                                 else return { id: 1, name: "mock-editted-app", storage: { id: 1 } }
                             }),
                             findMany: jest.fn().mockResolvedValue([{ id: 1, name: "mock-app" }]),
                             create: jest.fn().mockResolvedValue({ id: 1, secretKey: "mock-secret-key" }),
                             update: jest.fn().mockResolvedValue({ id: 1, name: "mock-editted-app" }),
                             delete: jest.fn()
                         },
                         storage: {
                             findUnique: jest.fn().mockResolvedValue({
                                 type: StorageTypesEnum.DEVELOPER
                             })
                         }
                    }
                },
                {
                    provide: "FILE_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObj: Record<string, string>, data) => {
                            switch (cmdObj.cmd) {
                                case "get_file_by_developer_cmd":
                                    return undefined
                                case "upload_file_cmd":
                                    return new Observable((subscriber) => subscriber.next({ id: 1, fileOriginalName: "mock-file.txt" }))
                            }
                        }),
                        emit: jest.fn()
                    }
                },
                {
                    provide: "USER_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObj: Record<string, string>, data) => {
                            switch (cmdObj.cmd) {
                                case "find_user_cmd":
                                    return new Observable((subscriber) => subscriber.next({ accountType: AccountTypeEnum.DEFAULT, apps: [] }))
                            }
                        })
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
       expect(await service.getFile(mockDeveloperData, "mock-file-name")).toBeUndefined()
    })
    
    it(`Uplaod file from developer to storage test`, async () => {
       expect(await service.uploadFile(mockDeveloperData, {} as unknown as Express.Multer.File)).toStrictEqual({ id: 1, fileOriginalName: "mock-file.txt" })
    })
    
    it(`Delete file from storage by developer test`, async () => {
       expect(await service.deleteFile(mockDeveloperData, `mock-file-name`)).toBeUndefined()
    })
})