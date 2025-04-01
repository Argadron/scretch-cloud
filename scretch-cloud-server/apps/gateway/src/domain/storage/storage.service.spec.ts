import { Test, TestingModule } from "@nestjs/testing";
import { StorageService } from "./storage.service"
import { ConfigModule } from "@nestjs/config";
import { StorageTypesEnum } from "@prisma/client";
import { CreateStorageDto } from "./dto/create-storage.dto";
import { UpdateStorageDto } from "./dto/update-storage.dto";
import { Observable } from "rxjs";

describe(`Storage Service`, () => {
    let service: StorageService;

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