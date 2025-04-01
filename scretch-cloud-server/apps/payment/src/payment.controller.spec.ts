import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
    let controller: PaymentController;

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
              validateSubscription: jest.fn().mockResolvedValue(undefined)
            }
          }
        ]
      }).compile()

      controller = module.get<PaymentController>(PaymentController)
    })

    it(`Test get all payments`, async () => {
      expect(await controller.getAll(1)).toStrictEqual({ id: 1, paymentUrlTag: "test-tag-mock" })
    })

    it(`Test create payment`, async () => {
        expect(await controller.createSubscription(1)).toStrictEqual({ payment: { id: 1, paymentUrlTag: "test-create-tag-mock" }, sessionId: 5  })
    })

    it(`Test cancel payment`, async () => {
        expect(await controller.cancelSubscriptionPayment({userId: 1, urlTag: "mock-tag"})).toBeUndefined()
    })

    it(`Test validate payment`, async () => {
        expect(await controller.validate({userId: 1, urlTag: `mock-tag`})).toBeUndefined()
    })
});
