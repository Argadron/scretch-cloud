import { Test, TestingModule } from '@nestjs/testing';
import { UserAppController } from './user-app.controller';
import { UserAppService } from './user-app.service';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { CreateConnectDto } from './dto/create-connect.dto';
import { Developer } from './interfaces';

describe('UserAppController', () => {
  let controller: UserAppController;
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
    const app: TestingModule = await Test.createTestingModule({
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
    }).compile();

    controller = app.get<UserAppController>(UserAppController);
  });

  it(`Get all apps test`, async () => {
        expect(await controller.getAll({ userId: 1 })).toStrictEqual([{ id: 1, name: "mock-app" }])
  })

  it(`Create a application test`, async () => {
     expect(await controller.create({dto: mockCreateAppData, userId: 1})).toStrictEqual({ id: 1, secretKey: "mock-secret-key" })
  })

  it(`Update a application test`, async () => {
     expect(await controller.update({dto: mockUpdateAppData, userId: 1})).toStrictEqual({ id: 1, name: "mock-editted-app" })
  })

  it(`Delete a application test`, async () => {
     expect(await controller.delete({ appId: 1, userId: 1 })).toBeUndefined()
  })

  it(`Create connect between application and storage test`, async () => {
     expect(await controller.createConnect({dto: mockCreateConnectData, userId: 1})).toStrictEqual({ id: 1, name: "mock-connected-app" })
  })

  it(`Disconnect storage from applicaton test`, async () => {
     expect(await controller.disconnect({ appId: 1, userId: 1 })).toBeUndefined()
  })

  it(`Get file from storage by developer test`, async () => {
     expect(await controller.getFile({developer: mockDeveloperData, fileName: "mock-file-name"})).toBeUndefined()
  })

  it(`Uplaod file from developer to storage test`, async () => {
     expect(await controller.uploadFile({developer: mockDeveloperData, file: {} as unknown as Express.Multer.File})).toStrictEqual({ id: 1, fileOriginalName: "mock-uploaded-file.txt" })
  })

  it(`Delete file from storage by developer test`, async () => {
     expect(await controller.deleteFile({developer: mockDeveloperData, fileName: `mock-file-name`})).toBeUndefined()
  })
});
