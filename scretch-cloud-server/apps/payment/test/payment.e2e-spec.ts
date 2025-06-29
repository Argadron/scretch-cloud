import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { AppConfigModule } from '@app/app-config';
import { PaymentController } from '../src/payment.controller';
import { PaymentService } from '../src/payment.service';
import { STRIPE_CLIENT } from '@app/stripe/constants';
import { DatabaseService } from '@app/database';
import { AccountTypeEnum, PaymentStatusEnum } from '@prisma/client';
import { JwtGuard } from '@app/shared';
import { Request } from 'express';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppConfigModule],
            controllers: [PaymentController],
            providers: [
                PaymentService,
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
                        },
                        subscriptions: {
                            cancel: jest.fn().mockResolvedValue({ status: "canceled" })
                        }
                    }
                },
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
                        getBy: jest.fn().mockResolvedValue({ accountType: AccountTypeEnum.DEFAULT }),
                        update: jest.fn()
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

        app = moduleFixture.createNestApplication()

        app.setGlobalPrefix(`/api`)

        await app.init()
    })

    it(`test case`, () => {
        expect(1).toBe(1)
    })

    afterEach(async () => {
        await app.close()
    })
});
