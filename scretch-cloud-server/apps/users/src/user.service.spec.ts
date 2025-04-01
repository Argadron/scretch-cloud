import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { DatabaseService } from "@app/database"

describe(`User Service`, () => {
    let service: UsersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: DatabaseService,
                    useValue: {
                        user: {
                            findUnique: jest.fn().mockResolvedValue({ id: 1, username: "mock" }),
                            create: jest.fn().mockResolvedValue({ id: 2, username: "super-mock" }),
                            update: jest.fn().mockResolvedValue({ id: 1, username: "updated-mock" })
                        }
                    }
                }
            ]
        }).compile()

        service = module.get<UsersService>(UsersService)
    })

    it(`Find user with mock args test`, async () => {
        expect(await service.findUnique({ where: { username: "super" } })).toStrictEqual({ id: 1, username: "mock" })
    })

    it(`Create user test`, async () => {
        expect(await service.create({ data: { username: "mock", password: "mock" } })).toStrictEqual({ id: 2, username: "super-mock" })
    })

    it(`Update user test`, async () => {
        expect(await service.update({ where: { id: 1 }, data: { } })).toStrictEqual({ id: 1, username: "updated-mock" })
    })
})