import { Test, TestingModule } from "@nestjs/testing"
import { PaymentService } from "./payment.service"
import { AppConfigModule } from "@app/app-config"
import { DatabaseService } from "@app/database"
import { AccountTypeEnum, PaymentStatusEnum } from "@prisma/client"
import { STRIPE_CLIENT } from "@app/stripe/constants"
import { Observable } from "rxjs"

describe(`Payment Service`, () => {
    let service: PaymentService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppConfigModule],
            providers: [
                PaymentService,
                {
                    provide: DatabaseService,
                    useValue: {
                        payment: {
                            findMany: jest.fn().mockResolvedValue([{ id: 1, paymentUrlTag: "mock-tag" }]),
                            create: jest.fn().mockResolvedValue({ id: 2, paymentUrlTag: "mock-created-tag" }),
                            findFirst: jest.fn().mockResolvedValue({ paymentStatus: PaymentStatusEnum.NOT_PAYED }),
                            updateMany: jest.fn(),
                            deleteMany: jest.fn()
                        },
                    }
                },
                {
                    provide: "USERS_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObject: Record<string, string>, data) => {
                            switch (cmdObject.cmd) {
                                case "find_user_cmd":
                                    return new Observable((subscriber) => subscriber.next({ accountType: AccountTypeEnum.DEFAULT }))
                                case "update_user_cmd":
                                    return null
                            }
                        })
                    }
                },
                {
                    provide: STRIPE_CLIENT,
                    useValue: {
                        checkout: {
                            sessions: {
                                list: jest.fn().mockResolvedValue({
                                    data: [
                                        {
                                            metadata: { userId: 1 },
                                            status: "complete",
                                            payment_status: "paid"
                                        }
                                    ]
                                }),
                                create: jest.fn().mockResolvedValue({
                                    id: "mock-stripe-id",
                                    url: "mock-stripe-url"
                                }),
                                expire: jest.fn()
                            }
                        }
                    }
                }
            ]
        }).compile()

        service = module.get<PaymentService>(PaymentService)
    })

    it(`Test get all payments`, async () => {
        expect(await service.getAll(1)).toStrictEqual([{ id: 1, paymentUrlTag: "mock-tag" }])
    })

    it(`Test create payment`, async () => {
        expect(await service.createSubscription(1)).toStrictEqual({ payment: { id: 2, paymentUrlTag: "mock-created-tag" }, sessionId: "mock-stripe-id", sessionUrl: "mock-stripe-url" })
    })

    it(`Test delete payment`, async () => {
        expect(await service.cancelSubscriptionPayment(1, `mock-tag`)).toBeUndefined()
    })

    it(`Test validate payment`, async () => {
        expect(await service.validateSubscription(1, `mock-tag`)).toBeUndefined()
    })
})