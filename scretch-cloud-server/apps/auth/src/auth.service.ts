import { stringTimeToSeconds } from '@app/shared';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AuthDto } from './dto/auth.dto';
import { Prisma, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { JwtUser } from './interfaces';
import { AppConfigService, JwtConfig } from '@app/app-config';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name)

    public constructor(
        private readonly jwtService: JwtService,
        private readonly appConfig: AppConfigService,
        @Inject("USER_CLIENT") private readonly usersClient: ClientProxy
    ) {}

    private async generateTokens(userId: number) {
        const { access_expires, refresh_expires } = this.appConfig.getJwtConfig() as JwtConfig

        const access = await this.jwtService.signAsync({ id: userId }, { expiresIn: stringTimeToSeconds(access_expires) })
        const refresh = await this.jwtService.signAsync({ id: userId }, { expiresIn: stringTimeToSeconds(refresh_expires) })

        return { access, refresh }
    }

    public async register({ username, password }: AuthDto) {
        if (await firstValueFrom(this.usersClient.send<User | null, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, { where: { username } }))) throw new RpcException({ message: `User with username ${username} already exsists!`, status: HttpStatus.CONFLICT })
    
        const user = await firstValueFrom(this.usersClient.send<User, Prisma.UserCreateArgs>({ cmd: "create_user_cmd" }, {
          data: {
              username, password: await hash(password, 3)
          }
        }))
    
        const { access, refresh } = await this.generateTokens(user.id)
    
        this.logger.log(`Success register`)
    
        return { access, refresh }
    }

    public async login({ username, password }: AuthDto) {
        const user = await firstValueFrom(this.usersClient.send<User | null, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, {
          where: {
              username
          }
        }))

        if (!user) throw new RpcException({ message: `Bad password or username`, status: HttpStatus.BAD_REQUEST })

        if (!await compare(password, user.password)) throw new RpcException({ message: `Bad password or username`, status: HttpStatus.BAD_REQUEST })

        const { access, refresh } = await this.generateTokens(user.id)

        this.logger.log(`Success login`)

        return { access, refresh }
    }

    public async refresh(token: string) {
        if (!token) throw new RpcException({ message: `Refresh token not provided`, status: HttpStatus.UNAUTHORIZED })

        try {
            const user = await this.jwtService.verifyAsync<JwtUser>(token) 

            const { access, refresh } = await this.generateTokens(user.id)

            this.logger.log(`Success refresh tokens`)

            return { access, refresh }
        } catch(e) {
            throw new RpcException({ message: `Refresh token invalid`, status: HttpStatus.UNAUTHORIZED })
        }
    }

    public async getMe(userId: number) {
        const user = await firstValueFrom(this.usersClient.send<User, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, {
          where: {
              id: userId
          },
          include: {
              storages: true
          }
        }))

        const { password, ...returnData } = user

        return returnData
    }
}
