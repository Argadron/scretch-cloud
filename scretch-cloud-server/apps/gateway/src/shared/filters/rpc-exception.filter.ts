import { ArgumentsHost, Catch, ExceptionFilter, InternalServerErrorException } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class RpcExceptionFiler implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        if (exception.message) {
            const res = host.switchToHttp().getResponse<Response>()

            res.status(exception.status).json({ message: exception.message })
        } else {
            throw new InternalServerErrorException(`Unknown exception is occured: ${exception}`)
        }
    }
}