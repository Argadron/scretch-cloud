import { Test, TestingModule } from "@nestjs/testing"
import { UserAppController } from "./user-app.controller"
import { UserAppService } from "./user-app.service"
import { JwtGuard } from "@guards/jwt.guard"
import { ExecutionContext } from "@nestjs/common"
import { Request, response } from "express"
import { DeveloperGuard } from "@guards/developer.guard"
import { CreateAppDto } from "./dto/create-app.dto"
import { UpdateAppDto } from "./dto/update-app.dto"
import { CreateConnectDto } from "./dto/create-connect.dto"
import { Developer } from "./interfaces"

describe(`UserApp Controller`, () => {
    let controller: UserAppController
    const mockCreateAppData: CreateAppDto = {
        name: "my-mocked-app"
    }
    const mockUpdateAppData: UpdateAppDto = {
        appId: 1,
        isNeedResetToken: false
    }
    const mockCreateConnectData: CreateConnectDto = {
        appId: 1,
        storageName: "mock-storage-name"
    }
    const mockDeveloperData: Developer = {
        applicationId: 1,
        userId: 1
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserAppController],
            providers: [
                {
                    provide: UserAppService,
                    useValue: {
                        getAll: jest.fn().mockResolvedValue([{ id: 1, name: "mock-app" }]),
                        create: jest.fn().mockResolvedValue({ id: 1, secretKey: "mock-secret-key" }),
                        update: jest.fn().mockResolvedValue({ id: 1, name: "mock-editted-app" }),
                        delete: jest.fn(),
                        createConnect: jest.fn().mockResolvedValue({ id: 1, name: "mock-connected-app" }),
                        disconnect: jest.fn(),
                        getFile: jest.fn(),
                        uploadFile: jest.fn().mockResolvedValue({ id: 1, fileOriginalName: "mock-uploaded-file.txt" }),
                        deleteFile: jest.fn()
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

        controller = module.get<UserAppController>(UserAppController)
    })

   it(`Get all apps test`, async () => {
      expect(await controller.getAll(1)).toStrictEqual([{ id: 1, name: "mock-app" }])
   })

   it(`Create a application test`, async () => {
      expect(await controller.create(mockCreateAppData, 1)).toStrictEqual({ id: 1, secretKey: "mock-secret-key" })
   })

   it(`Update a application test`, async () => {
      expect(await controller.update(mockUpdateAppData, 1)).toStrictEqual({ id: 1, name: "mock-editted-app" })
   })

   it(`Delete a application test`, async () => {
      expect(await controller.delete(1, 1)).toBeUndefined()
   })

   it(`Create connect between application and storage test`, async () => {
      expect(await controller.createConnect(mockCreateConnectData, 1)).toStrictEqual({ id: 1, name: "mock-connected-app" })
   })

   it(`Disconnect storage from applicaton test`, async () => {
      expect(await controller.disconnect(1, 1)).toBeUndefined()
   })

   it(`Get file from storage by developer test`, async () => {
      expect(await controller.downoladFile(mockDeveloperData, "mock-file-name", response)).toBeUndefined()
   })

   it(`Uplaod file from developer to storage test`, async () => {
      expect(await controller.uploadFile(mockDeveloperData, {} as unknown as Express.Multer.File)).toStrictEqual({ id: 1, fileOriginalName: "mock-uploaded-file.txt" })
   })

   it(`Delete file from storage by developer test`, async () => {
      expect(await controller.deleteFile(mockDeveloperData, `mock-file-name`)).toBeUndefined()
   })
})