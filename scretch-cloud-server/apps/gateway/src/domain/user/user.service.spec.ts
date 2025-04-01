import { Test, TestingModule } from "@nestjs/testing"
import { UserService } from "./user.service"
import { PrismaService } from "../../core/prisma/prisma.service"
import { Observable } from "rxjs"

describe(`User Service`, () => {
    let service: UserService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: "USERS_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObject: Record<string, string>, data) => {
                            switch (cmdObject.cmd) {
                                case "find_user_cmd":
                                    return new Observable((subcriber) => {
                                        subcriber.next({ id: 1, username: "mock" })
                                    })
                                case "create_user_cmd":
                                    return new Observable((subscriber) => { subscriber.next({ id: 2, username: "super-mock" }
                                    )})
                                case "update_user_cmd":
                                    return new Observable((subscriber) => { subscriber.next({ id: 1, username: "updated-mock" }) })
                            }
                        })
                    }
                }
            ]
        }).compile()

        service = module.get<UserService>(UserService)
    })

    it(`Find user with mock args test`, async () => {
        expect(await service.getBy({ where: { username: "super" } })).toStrictEqual({ id: 1, username: "mock" })
    })

    it(`Create user test`, async () => {
        expect(await service.create({ data: { username: "mock", password: "mock" } })).toStrictEqual({ id: 2, username: "super-mock" })
    })

    it(`Update user test`, async () => {
        expect(await service.update({ where: { id: 1 }, data: { } })).toStrictEqual({ id: 1, username: "updated-mock" })
    })
})