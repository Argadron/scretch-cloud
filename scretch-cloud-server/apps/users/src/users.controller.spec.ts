import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findUnique: jest.fn().mockResolvedValue({ id: 1, username: "John Doe" }),
            create: jest.fn().mockResolvedValue({ id: 2, username: "Indian Doe" }),
            update: jest.fn().mockResolvedValue({ id: 1, username: "John Doe" })
          }
        }
      ]
    }).compile();

    controller = app.get<UsersController>(UsersController);
  });

  it(`Get unqiue user test`, async () => {
    expect(await controller.findUser({ where: { id: 1 } })).toStrictEqual({ id: 1, username: "John Doe" })
  })

  it(`Create user test`, async () => {
    expect(await controller.createUser({ data: { username: "Indian Doe", password: "storngPassword" } })).toStrictEqual({ id: 2, username: "Indian Doe" })
  })

  it(`Update user test`, async () => {
    expect(await controller.updateUser({ where: { id: 1 }, data: { username: "John Doe" } })).toStrictEqual({ id: 1, username: "John Doe" })
  })
});
