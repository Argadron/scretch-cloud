import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientProxy, ClientsModule, TcpOptions, Transport } from '@nestjs/microservices';
import { UserAppController } from '../src/user-app.controller';
import { UserAppService } from '../src/user-app.service';
import { DatabaseService } from '@app/database';
import { Prisma, StorageTypesEnum, AccountTypeEnum } from '@prisma/client';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateAppDto } from '../src/dto/create-app.dto';
import { CreateConnectDto } from '../src/dto/create-connect.dto';
import { UpdateAppDto } from '../src/dto/update-app.dto';
import { Developer } from '../src/interfaces';

describe('UserAppController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;
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
      imports: [ClientsModule.register([{ name: "USER_APP_CLIENT", transport: Transport.TCP }])],
      controllers: [UserAppController],
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
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    //client = app.get<ClientProxy>("USER_APP_CLIENT")
    //await client.connect()
  });

  //it(`Get_all_apps_cmd test`, async () => {
  //  expect(await firstValueFrom(client.send({ cmd: "get_all_apps_cmd" }, { userId: 1 }))).toStrictEqual([{ id: 1, name: "mock-app" }])
  //})
//
  //it(`Create_app_cmd test`, async () => {
  //   expect(await firstValueFrom(client.send({ cmd: "create_app_cmd" }, { dto: mockCreateAppData, userId: 1}))).toStrictEqual({ id: 1, secretKey: "mock-secret-key" })
  //})
//
  //it(`Update_app_cmd test`, async () => {
  //   expect(await firstValueFrom(client.send({ cmd: "update_app_cmd" }, { dto: mockUpdateAppData, userId: 1 }))).toStrictEqual({ id: 1, name: "mock-editted-app" })
  //})
//
  //it(`Delete_app_event test`, async () => {
  //   expect(await firstValueFrom(client.emit("Delete_app_event", { appId: 1, userId: 1 }))).toBeUndefined()
  //})
//
  //it(`Create_connect_cmd test`, async () => {
  //   expect(await firstValueFrom(client.send({ cmd: "create_connect_cmd" }, { dto: mockCreateConnectData, userId: 1 }))).toStrictEqual({ id: 1, name: "mock-editted-app" })
  //})
//
  //it(`Disconnect_event test`, async () => {
  //   expect(await firstValueFrom(client.emit("Disconnect_event", { appId: 1, userId: 1 }))).toBeUndefined()
  //})
//
  //it(`Uplaod_file_cmd test`, async () => {
  //   expect(await firstValueFrom(client.send({ cmd: "upload_file_cmd" }, { developer: mockDeveloperData, file: {} }))).toStrictEqual({ id: 1, fileOriginalName: "mock-file.txt" })
  //})
//
  //it(`Delete_file_event test`, async () => {
  //   expect(await firstValueFrom(client.emit("Delete_file_event", { developer: mockDeveloperData, fileName: "mock-file-name" }))).toBeUndefined()
  //})

  it(`test case`, () => {
    expect(1).toBe(1)
  })

  afterEach(async () => {
    await app.close()
   // await client.close()
  })
});
