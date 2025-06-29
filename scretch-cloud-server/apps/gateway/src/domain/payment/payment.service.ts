import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Payment } from "@prisma/client";
import { firstValueFrom } from "rxjs";

@Injectable()
export class PaymentService {
    public constructor(
        @Inject("PAYMENT_CLIENT") private readonly paymentClient: ClientProxy
    ) {}

    public async getAll(userId: number) {
        return await firstValueFrom(this.paymentClient.send<Payment[] | null, number>({ cmd: "get_all_payments_cmd" }, userId))
    }

    public async createSubscription(userId: number) {
       return await firstValueFrom(this.paymentClient.send<{ sessionId: String, sessionUrl: String, payment: Payment }, number>({ cmd: "create_subcription_cmd" }, userId))
    }

    public async cancelSubscriptionPayment(userId: number, urlTag: string) {
        return await firstValueFrom(this.paymentClient.emit<void, { userId: Number, urlTag: String }>("Cancel_subscription_event", { userId, urlTag }))
    }

    public async validateSubscription(userId: number, urlTag: string) {
        return await firstValueFrom(this.paymentClient.emit<void, { userId: Number, urlTag: String }>("Validate_payment_event", { userId, urlTag }))
    }

    public async cancelSubscription(userId: number) {
        return await firstValueFrom(this.paymentClient.emit<void, { userId: Number }>("Cancel_subscription_actived_event", { userId }))
    }
}