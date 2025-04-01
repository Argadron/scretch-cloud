import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentController {
  public constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern({ cmd: "get_all_payments_cmd" })
  public async getAll(@Payload() userId: number) {
    return await this.paymentService.getAll(userId)
  }

  @MessagePattern({ cmd: "create_subcription_cmd" })
  public async createSubscription(@Payload() userId: number) {
    return await this.paymentService.createSubscription(userId)
  }

  @EventPattern("Cancel_subscription_event")
  public async cancelSubscriptionPayment(@Payload() { userId, urlTag }: { userId: number, urlTag: string }) {
    return await this.paymentService.cancelSubscriptionPayment(userId, urlTag)
  }

  @EventPattern("Validate_payment_event")
  public async validate(@Payload() { userId, urlTag }: { userId: number, urlTag: string }) {
    return await this.paymentService.validateSubscription(userId, urlTag)
  }
}
