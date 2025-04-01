import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { StorageTypesEnum } from '@prisma/client';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';

describe('StorageController', () => {
  let controller: StorageController;
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
    const app: TestingModule = await Test.createTestingModule({
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
      }]
    }).compile();

    controller = app.get<StorageController>(StorageController);
  });

  it(`Get details info about storage test`, async () => {
      expect(await controller.getByName({name: "mock", userId: 1})).toStrictEqual({ id: 1, name: "Test storage" })
  })

  it(`Create a new storage test`, async () => {
      expect(await controller.create({dto: mockCreateStorageData, userId: 1})).toStrictEqual({ id: 1, name: "Test storage" })
  })

  it(`Update a storage test`, async () => {
      expect(await controller.update({dto: mockUpdateStorageData, userId: 1})).toStrictEqual({ id: 1, name: "Test updated storage" })
  })

  it(`Delete a storage test`, async () => {
      expect((await controller.delete({name: "Test storage", userId: 1}))).toStrictEqual({ id: 1, name: "Test storage" })
  })
});
