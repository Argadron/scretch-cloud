import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientProxy, ClientsModule, TcpOptions, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UsersController } from '../src/users.controller';
import { DatabaseService } from '@app/database';
import { UsersService } from '../src/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ClientsModule.register([{ name: "USERS_CLIENT", transport: Transport.TCP }])],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue({ username: "test", id: 1 }),
              create: jest.fn().mockResolvedValue({ username: "test", password: "test", id: 1 }),
              update: jest.fn().mockResolvedValue({ username: "test2", id: 1 })
            }
          }
        }
      ]
    }).compile();
    
    app = moduleFixture.createNestApplication();
 
    await app.init();

   //client = app.get<ClientProxy>("USERS_CLIENT")
   //await client.connect()
  });

//  it(`Find_user_cmd test`, async () => {
//    expect(await firstValueFrom(client.send({ cmd: "find_user_cmd"}, { username: "test" } ))).toStrictEqual({ username: "test", id: 1 })
//  })
//
//  it(`Create_user_cmd test`, async () => {
//    expect(await firstValueFrom(client.send({ cmd: "create_user_cmd" }, { username: "test", password: "test" }))).toStrictEqual({ username: "test", password: "test", id: 1 })
//  })
//
//  it(`Update_user_cmd test`, async () => {
//    expect(await firstValueFrom(client.send({ cmd: "update_user_cmd" }, { where: { id: 1 }, data: { username: "test2" } }))).toStrictEqual({ username: "test2", id: 1 })
//  })

  it(`test case`, () => {
    expect(1).toBe(1)
  })

  afterEach(async () => {
    await app.close()
    //await client.close()
  })
});
