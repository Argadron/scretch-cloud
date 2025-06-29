import { AppConfigService } from '@app/app-config';
import { DatabaseService } from '@app/database';
import { InjectStripe } from '@app/stripe';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AccountTypeEnum, PaymentStatusEnum, Prisma, User } from '@prisma/client';
import { firstValueFrom } from 'rxjs'
import Stripe from 'stripe';
import { v4 } from 'uuid';

@Injectable()
export class PaymentService {
  private readonly logger: Logger = new Logger(PaymentService.name)
  private clientAPIUrl: string

  public constructor(
      private readonly prisma: DatabaseService,
      private readonly config: AppConfigService,
      @Inject("USERS_CLIENT") private readonly usersClient: ClientProxy,
      @InjectStripe() private readonly stripe: Stripe,
  ) {
      this.clientAPIUrl = config.getServerConfig("api_client_url") as string
  }

  private generateSubcriptionElement(): Stripe.Checkout.SessionCreateParams.LineItem[] {
      return [{
          price_data: {
              unit_amount: this.config.getStripeConfig("stripe_pro_price") as number * 100,
              currency: "rub",
              product_data: {
                  name: "PRO profile subscription plan in Scretch Cloud"
              },
              recurring: {
                  interval: `month`
              }
          },
          quantity: 1
      }]
  }

  public async getAll(userId: number) {
      const payments = await this.prisma.payment.findMany({
          where: {
              userId
          }
      })

      this.logger.log(`Success getted payments`)

      return payments
  }

  public async createSubscription(userId: number) {
      const user = await firstValueFrom(this.usersClient.send<User, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, { where: { id: userId } }))

      if (user.accountType === AccountTypeEnum.PRO) throw new RpcException({ message: `Your account already has PRO subcribe!`, status: HttpStatus.BAD_REQUEST })

      const list = await this.stripe.checkout.sessions.list()

      list.data.forEach(element => {
          if (+element.metadata.userId === userId && element.status === `open`) throw new RpcException({ message: `You already has not payed payment ${element.url}`, status: HttpStatus.BAD_REQUEST })
      })

      const id = v4()

      const session = await this.stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: this.generateSubcriptionElement(),
          currency: "rub",
          metadata: {
              "userId": userId
          },
          success_url: `${this.clientAPIUrl}/success-pro.html?urlTag=${id}`,
          cancel_url: `${this.clientAPIUrl}/cancel-pro.html?urlTag=${id}`,
      })

      const payment = await this.prisma.payment.create({
          data: {
              userId,
              paymentStatus: PaymentStatusEnum.NOT_PAYED,
              paymentUrlTag: id,
              paymentStripeId: session.id,
              paymentStripeUrl: session.url
          }
      })

      this.logger.log(`Successfly created payment`)

      return {
          payment,
          sessionId: session.id,
          sessionUrl: session.url
      }
  }

  public async validateSubscription(userId: number, urlTag: string) {
      const payment = await this.prisma.payment.findFirst({
          where: {
              userId,
              paymentUrlTag: urlTag
          }
      })

      if (!payment) throw new RpcException({ message: `Payment is not found`, status: HttpStatus.NOT_FOUND })
      if (payment.paymentStatus === PaymentStatusEnum.PAYED) throw new RpcException({ message: `This payment already has payed!`, status: HttpStatus.BAD_REQUEST })

      const list = await this.stripe.checkout.sessions.list()

      const session = list.data.find(element => {
          if (+element.metadata.userId === userId) return element
      })

      if (!session) throw new RpcException({ message: `Session is not found`, status: HttpStatus.NOT_FOUND })

      if (session.payment_status === `paid`) {
          await this.prisma.payment.updateMany({
              where: {
                  userId,
                  paymentUrlTag: urlTag
              },
              data: {
                  paymentStatus: PaymentStatusEnum.PAYED
              }
          })
          
          await firstValueFrom(this.usersClient.send<User, Prisma.UserUpdateArgs>({ cmd: "update_user_cmd" }, {
            where: {
                id: userId
            },
            data: {
                accountType: AccountTypeEnum.PRO
            }
          }))

          this.logger.log(`Successfly validated payment`)
      }
      else throw new RpcException({ message: `Payment is not payed`, status: HttpStatus.BAD_REQUEST })
  }

  public async cancelSubscriptionPayment(userId: number, urlTag: string) {
      const payment = await this.prisma.payment.findFirst({
          where: {
              userId,
              paymentUrlTag: urlTag
          }
      })

      if (!payment) throw new RpcException({ message: "Payment is not founded!", status: HttpStatus.NOT_FOUND })

      await this.stripe.checkout.sessions.expire(payment.paymentStripeId)
      await this.prisma.payment.deleteMany({
          where: {
              userId,
              paymentUrlTag: urlTag
          }
      })

      this.logger.log(`Successfly canceled payment`)
  }

  public async cancelSubscription(userId: number) {
    const user = await firstValueFrom(this.usersClient.send<User, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, { where: { id: userId } }))

    if (user.accountType !== AccountTypeEnum.PRO) throw new RpcException({ message: `Your account dont have PRO subscription`, status: HttpStatus.BAD_REQUEST })

    const payment = await this.prisma.payment.findMany({
        where: {
            userId,
            paymentStatus: PaymentStatusEnum.PAYED
        } 
    })

    if (!payment.length) throw new RpcException({ message: "Payment doesnt founded!", status: HttpStatus.NOT_FOUND })

    const session = await this.stripe.checkout.sessions.retrieve(payment[0].paymentStripeId)
    const stripePayment = await this.stripe.subscriptions.cancel(session.subscription as string)

    if (stripePayment.status === "canceled") {
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    accountType: AccountTypeEnum.DEFAULT
                }
            }),
            this.prisma.payment.deleteMany({
                where: {
                    userId,
                    paymentStatus: PaymentStatusEnum.PAYED
                }
            })
        ])

        this.logger.log(`Success canceled actived subscription`)
    }
    else throw new RpcException({ message: "Unhandled error occupped", status: HttpStatus.INTERNAL_SERVER_ERROR })
  }
}
