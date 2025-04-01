import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtUser } from "../interfaces";
import { AppConfigService } from "@app/app-config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly config: AppConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getJwtConfig("secret"),
            ignoreExpiration: false
        })
    }

    async validate(user: JwtUser) {
        return user
    }
}