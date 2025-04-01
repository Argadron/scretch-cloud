import { Inject, Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class UserService {
    public constructor(
        @Inject(`USERS_CLIENT`) private readonly usersClient: ClientProxy
    ) {}

    public async getBy(findArgs: Prisma.UserFindUniqueArgs) {
        return await firstValueFrom(this.usersClient.send<User, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, findArgs))
    }

    public async create(data: Prisma.UserCreateArgs) {
        return await firstValueFrom(this.usersClient.send<User, Prisma.UserCreateArgs>({ cmd: "create_user_cmd" }, data))
    }

    public async update(data: Prisma.UserUpdateArgs) {
        return await firstValueFrom(this.usersClient.send<User, Prisma.UserUpdateArgs>({ cmd: "update_user_cmd" }, data))
    }
}