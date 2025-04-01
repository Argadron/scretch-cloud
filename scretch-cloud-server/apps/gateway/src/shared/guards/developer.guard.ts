import { ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "../../core/prisma/prisma.service";
import { Request } from 'express'

@Injectable()
export class DeveloperGuard {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean | Observable<boolean>> {
        const request = context.switchToHttp().getRequest<Request>()

        const apiKey = request.headers["x-api-key"]

        if (!apiKey) return false 

        const app = await this.prisma.app.findUnique({
            where: {
                secretKey: apiKey as string
            },
            include: {
                user: true
            }
        })

        if (!app) return false 

        request.user = {
            userId: app.user.id,
            applicationId: app.id
        }

        return true
    }
}