import { Test, TestingModule } from "@nestjs/testing"
import { PaymentController } from "./payment.controller"
import { PaymentService } from "./payment.service"
import { JwtGuard } from "@guards/jwt.guard"
import { ExecutionContext } from "@nestjs/common"
import { Request } from "express"

describe(`Payment Controller`, () => {
    let controller: PaymentController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                {
                    provide: PaymentService,
                    useValue: {
                        getAll: jest.fn().mockResolvedValue({ id: 1, paymentUrlTag: "test-tag-mock" }),
                        createSubscription: jest.fn().mockResolvedValue({ payment: { id: 1, paymentUrlTag: "test-create-tag-mock" }, sessionId: 5  }),
                        cancelSubscriptionPayment: jest.fn().mockResolvedValue(undefined),
                        validateSubscription: jest.fn().mockResolvedValue(undefined),
                        cancelSubscription: jest.fn().mockResolvedValue(undefined)
                    }
                }
            ]
        }).overrideGuard(JwtGuard).useValue({
            canActivate: (ctx: ExecutionContext) => {
                const request = ctx.switchToHttp().getRequest<Request>()

                request.user = {
                    id: 1
                }

                return true
            }
        }).compile()

        controller = module.get<PaymentController>(PaymentController)
    })

    it(`Test get all payments`, async () => {
        expect(await controller.getAll(1)).toStrictEqual({ id: 1, paymentUrlTag: "test-tag-mock" })
    })

    it(`Test create payment`, async () => {
        expect(await controller.create(1)).toStrictEqual({ payment: { id: 1, paymentUrlTag: "test-create-tag-mock" }, sessionId: 5  })
    })

    it(`Test cancel payment`, async () => {
        expect(await controller.cancel(1, "mock-tag")).toBeUndefined()
    })

    it(`Test validate payment`, async () => {
        expect(await controller.validate(1, `mock-tag`)).toBeUndefined()
    })

    it(`Test cancel plan`, async () => {
        expect(await controller.cancelPlan(1)).toBeUndefined()
    })
})