import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';

@Controller()
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: "find_user_cmd" })
  public async findUser(@Payload() payload: Prisma.UserFindUniqueArgs) {
    return await this.usersService.findUnique(payload)
  }

  @MessagePattern({ cmd: "create_user_cmd" })
  public async createUser(@Payload() payload: Prisma.UserCreateArgs) {
    return await this.usersService.create(payload)
  }

  @MessagePattern({ cmd: "update_user_cmd" })
  public async updateUser(@Payload() payload: Prisma.UserUpdateArgs) {
    return await this.usersService.update(payload)
  }
}
