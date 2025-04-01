import { Auth } from "@decorators/auth.decorator";
import { CurrentUser } from "@decorators/user.decorator";
import { Controller, Delete, Get, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { PaymentService } from "./payment.service";

@Controller(`/payment`)
@ApiTags(`Payment Controller`)
@Auth()
export class PaymentController {
    public constructor(private readonly paymentService: PaymentService) {}

    @ApiOperation({ summary: `Get all payments` })
    @ApiOkResponse({ description: `Payments getted successfly` })
    @ApiUnauthorizedResponse({ description: `No access token / token invalid` })
    @ApiBearerAuth()
    @Get(`/all`)
    @HttpCode(HttpStatus.OK)
    public async getAll(@CurrentUser(`id`) userId: number) {
        return await this.paymentService.getAll(userId)
    }

    @ApiOperation({ summary: "Create profile payment" })
    @ApiOkResponse({ description: `Success created payment in WAITING status` })
    @ApiBadRequestResponse({ description: `Your account already has PRO subscribe / Not payed session` })
    @ApiUnauthorizedResponse({ description: `No access token / token invalid` })
    @ApiBearerAuth()
    @Get(`/subcribe`)
    @HttpCode(HttpStatus.OK)
    public async create(@CurrentUser(`id`) userId: number) {
        return await this.paymentService.createSubscription(userId) 
    }

    @ApiOperation({ summary: "Cancel payment" })
    @ApiNoContentResponse({ description: "Success canceled payment" })
    @ApiNotFoundResponse({ description: "Payment with provided id is not founded" })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiBearerAuth()
    @Delete(`/cancel/:id`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async cancel(@CurrentUser(`id`) userId: number, @Param(`id`) urlTag: string) {
        return await this.paymentService.cancelSubscriptionPayment(userId, urlTag)
    }

    @ApiOperation({ summary: "Validate payment" })
    @ApiNoContentResponse({ description: `Success updated account to PRO type` })
    @ApiBadRequestResponse({ description: `Not payed` })
    @ApiNotFoundResponse({ description: `Session / Payment is not founded` })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiBearerAuth()
    @Get(`/validate/:id`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async validate(@CurrentUser(`id`) userId: number, @Param(`id`) urlTag: string) {
        return await this.paymentService.validateSubscription(userId, urlTag)
    }
}