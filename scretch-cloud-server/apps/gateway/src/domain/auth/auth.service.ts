import { stringTimeToSeconds } from "@app/shared";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Response } from "express";
import { AuthDto } from "./dto/auth.dto";
import { firstValueFrom } from "rxjs";
import { User } from "@prisma/client";
import { AppConfigService, JwtConfig, ServerConfig } from "@app/app-config";

@Injectable()
export class AuthService {
    public constructor(
        private readonly config: AppConfigService,
        @Inject("AUTH_CLIENT") private readonly authClient: ClientProxy
    ) {}

    private addRefreshToCookie(token: string, res: Response) {
            const serverConfig = this.config.getServerConfig() as ServerConfig
            const jwtConfig = this.config.getJwtConfig() as JwtConfig

            if (serverConfig.node_env === `test`) return;
    
            res.cookie(this.config.getSwaggerConfig("refresh_token_name") as string, token, {
                httpOnly: true,
                sameSite: serverConfig.node_env === "development" ? "none":"lax",
                secure: true,
                maxAge: stringTimeToSeconds(jwtConfig.refresh_cookie_expires) * 1000
            })
    }

    public async register(dto: AuthDto, res: Response) {
        const { access, refresh } = await firstValueFrom(this.authClient.send<{ access: String, refresh: string }, { dto: AuthDto }>({ cmd: "register_cmd" }, { dto }))

        this.addRefreshToCookie(refresh, res)

        return { access }
    }

    public async login(dto: AuthDto, res: Response) {
        const { access, refresh } = await firstValueFrom(this.authClient.send<{ access: String, refresh: string }, { dto: AuthDto }>({ cmd: "login_cmd" }, { dto }))

        this.addRefreshToCookie(refresh, res)

        return { access }
    }

    public async refresh(token: string, res: Response) {
        const { access, refresh } = await firstValueFrom(this.authClient.send<{ access: String, refresh: string }, { token: String }>({ cmd: "refresh_cmd" }, { token }))

        this.addRefreshToCookie(refresh, res)

        return { access }
    }

    public async getMe(userId: number) {
        return await firstValueFrom(this.authClient.send<User, { userId: Number }>({ cmd: "get_me_cmd" }, { userId }))
    }
}
