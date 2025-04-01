import { Test, TestingModule } from "@nestjs/testing"
import { StorageService } from "./storage.service"
import { AppConfigModule } from "@app/app-config"
import { DatabaseService } from "@app/database"
import { AccountTypeEnum, Prisma, StorageTypesEnum } from "@prisma/client"
import { Observable } from "rxjs"
import { CreateStorageDto } from "./dto/create-storage.dto"
import { UpdateStorageDto } from "./dto/update-storage.dto"

describe(`Storage Service`, () => {
    let service: StorageService

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
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppConfigModule],
            providers: [
                StorageService,
                {
                    provide: DatabaseService,
                    useValue: {
                        storage: {
                            findUnique: jest.fn().mockImplementation((args: Prisma.StorageFindUniqueArgs) => {
                                if (args.where?.name_userId) {
                                    const values = Object.values(args.where.name_userId)    
                                    const elem = values.find((elem) => {
                                        if (elem === `Test storage`) return elem
                                    })  
                                    if (elem) return null 
                                    else return {
                                        id: 1,
                                        name: "Super test storage"
                                    }
                                } 
                            }),
                            create: jest.fn().mockResolvedValue({
                                id: 1,
                                name: "A new storage"
                            }),
                            update: jest.fn().mockResolvedValue({
                                id: 1,
                                name: "A updated storage"
                            }),
                            delete: jest.fn().mockResolvedValue({
                                id: 1,
                                name: "A new storage"
                            })
                        },
                    }
                },
                {
                    provide: "USERS_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObj: Record<string, string>, data) => {
                            switch (cmdObj.cmd) {
                                case "find_user_cmd": 
                                    return new Observable((subscriber) => subscriber.next({ accountType: AccountTypeEnum.DEFAULT, storages: []}))
                            }
                        })
                    }
                }
            ]
        }).compile()

        service = module.get<StorageService>(StorageService)
    })

    it(`Get details info about one storage test`, async () => {
        expect(await service.getByName("Super test storage", 1)).toStrictEqual({ id: 1, name: "Super test storage" })
    })

    it(`Create a new storage test`, async () => {
        expect(await service.create(mockCreateStorageData, 1)).toStrictEqual({ id: 1, name: "A new storage" })
    })

    it(`Update a storage test`, async () => {
        expect(await service.update(mockUpdateStorageData, 1)).toStrictEqual({ id: 1, name: "A updated storage" })
    })

    it(`Delete a storage test`, async () => {
        expect(await service.delete("Not test storage", 1)).toStrictEqual({ id: 1, name: "A new storage" })
    })
})