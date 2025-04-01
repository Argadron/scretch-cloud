import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const Token = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    
    return request.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME]
})