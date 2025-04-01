import { Test, TestingModule } from "@nestjs/testing"
import { StorageController } from "./storage.controller"
import { StorageService } from "./storage.service"
import { JwtGuard } from "@guards/jwt.guard"
import { ExecutionContext } from "@nestjs/common"
import { Request } from "express"
import { CreateStorageDto } from "./dto/create-storage.dto"
import { StorageTypesEnum } from "@prisma/client"
import { UpdateStorageDto } from "./dto/update-storage.dto"

describe(`Storage Controller`, () => {
    let controller: StorageController

    const mockCreateStorageData: CreateStorageDto = {
        name: "My first storage",
        size: 50,
        type: StorageTypesEnum.DEFAULT
    }
    const mockUpdateStorageData: UpdateStorageDto = {
        name: "My first storage",
        size: 100
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StorageController],
            providers: [
                {
                    provide: StorageService,
                    useValue: {
                        getByName: jest.fn().mockResolvedValue({
                            id: 1,
                            name: "Test storage"
                        }),
                        create: jest.fn().mockResolvedValue({
                            id: 1,
                            name: "Test storage"
                        }),
                        update: jest.fn().mockResolvedValue({
                            id: 1,
                            name: "Test updated storage"
                        }),
                        delete: jest.fn().mockResolvedValue({
                            id: 1,
                            name: "Test storage"
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

        controller = module.get<StorageController>(StorageController)
    })

    it(`Get details info about storage test`, async () => {
        expect(await controller.getByName("mock", 1)).toStrictEqual({ id: 1, name: "Test storage" })
    })

    it(`Create a new storage test`, async () => {
        expect(await controller.create(mockCreateStorageData, 1)).toStrictEqual({ id: 1, name: "Test storage" })
    })

    it(`Update a storage test`, async () => {
        expect(await controller.update(mockUpdateStorageData, 1)).toStrictEqual({ id: 1, name: "Test updated storage" })
    })

    it(`Delete a storage test`, async () => {
        expect((await controller.delete("Test storage", 1))).toStrictEqual({ id: 1, name: "Test storage" })
    })
})