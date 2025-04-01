import { Test, TestingModule } from "@nestjs/testing"
import { PaymentService } from "./payment.service"
import { Observable } from "rxjs"

describe(`Payment service`, () => {
    let service: PaymentService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: "PAYMENT_CLIENT",
                    useValue: {
                        send: jest.fn().mockImplementation((cmdObj: Record<string, string>, data) => {
                            switch (cmdObj.cmd) {
                                case "get_all_payments_cmd":
                                    return new Observable((subscriber) => subscriber.next([{ id: 1, paymentUrlTag: "mock-tag" }]))
                                case "create_subcription_cmd":
                                    return new Observable((subscriber) => subscriber.next({ payment: { id: 2, paymentUrlTag: "mock-created-tag" }, sessionId: "mock-stripe-id", sessionUrl: "mock-stripe-url" }))
                            }
                        }),
                        emit: jest.fn().mockImplementation(() => new Observable((subscriber) => subscriber.next(undefined)))
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