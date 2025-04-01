import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { IUsersMaxStorageSizes } from './interfaces';
import { DatabaseService } from '@app/database';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateStorageDto } from './dto/create-storage.dto';
import { firstValueFrom } from 'rxjs';
import { AccountTypeEnum, Prisma, User } from '@prisma/client';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { stringSizeToBytes } from '@app/shared';
import { AppConfigService } from '@app/app-config';

@Injectable()
export class StorageService {
  private readonly usersMaxStorageSizes: IUsersMaxStorageSizes
    private readonly logger: Logger = new Logger(StorageService.name)

    public constructor(
        private readonly prisma: DatabaseService,
        private readonly config: AppConfigService,
        @Inject("USERS_CLIENT") private readonly usersClient: ClientProxy,
    ) {
        this.usersMaxStorageSizes = {
            DEFAULT: stringSizeToBytes(config.getStorageConfig("default_storage_limit")),
            PRO: stringSizeToBytes(config.getStorageConfig("pro_storage_limit"))
        }
    }

    private calcStorageSizeAndThrowLimit(storages: Storage[], storageName: string, newStorageSize: number, accountType: AccountTypeEnum): number {
        const storageSize = storages.reduce((accum, elem) => {
            if (elem.name === storageName) throw new RpcException({ message: `Storage with provided name already exsists!`, status: HttpStatus.CONFLICT })

            return accum + elem.size
        }, 0)

        if (storageSize + newStorageSize > this.usersMaxStorageSizes[accountType]) throw new RpcException({ message: `Your new storages size > than limit your account`, status: HttpStatus.BAD_REQUEST })

        return storageSize
    }

    private async checkStorageExsistsOrThrow(name: string, userId: number) {
        const storage = await this.prisma.storage.findUnique({ where: { name_userId: { name, userId } } })

        if (!storage) throw new RpcException({ message: `Storage was not found`, status: HttpStatus.NOT_FOUND })

        return storage
    }

    public async getByName(name: string, userId: number) {
        const storage = await this.prisma.storage.findUnique({
            where: {
                name_userId: {
                    name,
                    userId
                }
            },
            include: {
                files: true
            }
        })

        if (!storage) throw new RpcException({ message: `Storage with provided id is not founded!`, status: HttpStatus.NOT_FOUND })

        this.logger.log(`Successfly getted details info about storage`)

        return storage
    }

    public async create(dto: CreateStorageDto, userId: number) {
        const user = await firstValueFrom(this.usersClient.send<User, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, {
          where: {
              id: userId
          },
          include: {
              storages: true
          }
        }))

        this.calcStorageSizeAndThrowLimit(user["storages"], dto.name, dto.size, user.accountType)

        const storage = await this.prisma.storage.create({
            data: {
                ...dto,
                userId: user.id
            }
        })

        this.logger.log(`Success created storage`)

        return storage
    }

    public async update(dto: UpdateStorageDto, userId: number) {
        const user = await firstValueFrom(this.usersClient.send<User, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, {
          where: {
              id: userId
          },
          include: {
              storages: true
          }
      }))

        this.calcStorageSizeAndThrowLimit(user["storages"], dto.newName, dto.size, user.accountType)

        const storage = await this.checkStorageExsistsOrThrow(dto.name, user.id)
        
        const updatedStorage = await this.prisma.storage.update({
            where: {
                name_userId: {
                    name: dto.name,
                    userId: user.id
                }
            },
            data: {
                name: dto.newName ? dto.newName: storage.name,
                size: dto.size ? dto.size : storage.size
            }
        })

        this.logger.log(`Storage updated successfly`)

        return updatedStorage
    }

    public async delete(name: string, userId: number) {
        await this.checkStorageExsistsOrThrow(name, userId)

        const deletedStorage = await this.prisma.storage.delete({
            where: {
                name_userId: {
                    name,
                    userId
                }
            }
        })

        this.logger.log(`Success deleted storage`)

        return deletedStorage
    }
}
