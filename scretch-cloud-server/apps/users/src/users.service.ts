import { DatabaseService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  public constructor(private readonly prisma: DatabaseService) {}

  public async findUnique(findArgs: Prisma.UserFindUniqueArgs) {
    return await this.prisma.user.findUnique(findArgs)
  }

  public async create(data: Prisma.UserCreateArgs) {
    return await this.prisma.user.create(data)
  }

  public async update(data: Prisma.UserUpdateArgs) {
    return await this.prisma.user.update(data)
  }
}
