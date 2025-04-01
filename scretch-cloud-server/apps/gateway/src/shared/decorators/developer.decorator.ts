import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const CurrentDeveloper = createParamDecorator((data: keyof { userId: number, applicationId: number }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>() 

    return data ? request.user[data] : request.user
})