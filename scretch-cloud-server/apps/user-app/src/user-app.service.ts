import { DatabaseService } from '@app/database';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateAppDto } from './dto/create-app.dto';
import { AccountTypeEnum, App, File, Prisma, StorageTypesEnum, User } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { v4 } from 'uuid';
import { UpdateAppDto } from './dto/update-app.dto';
import { CreateConnectDto } from './dto/create-connect.dto';
import { Developer } from './interfaces';

@Injectable()
export class UserAppService {
  private readonly logger: Logger = new Logger(UserAppService.name)

    public constructor(
        private readonly prisma: DatabaseService,
        @Inject("FILE_CLIENT") private readonly fileClient: ClientProxy,
        @Inject("USER_CLIENT") private readonly userClient: ClientProxy
    ) {}

    private async checkAppHaveStorage(applicationId: number, userId: number) {
        const app = await this.prisma.app.findUnique({
            where: {
                id: applicationId,
                userId
            },
            include: {
                storage: true
            }
        })

        if (!app.storage) throw new RpcException({ message: `Application hasnt connected storage`, status: HttpStatus.BAD_REQUEST })
    }

    public async getAll(userId: number) {
        const apps = await this.prisma.app.findMany({
            where: {
                userId
            },
            include: {
                storage: true
            }
        })

        this.logger.log(`Succesfly getted apps`)

        return apps
    }

    public async create(dto: CreateAppDto, userId: number) {
        const user = await firstValueFrom(this.userClient.send<User, Prisma.UserFindUniqueArgs>({ cmd: "find_user_cmd" }, {
          where: {
              id: userId
          },
          include: {
              apps: true
          }
        }))

        if (user.accountType === AccountTypeEnum.DEFAULT && user["apps"].length > 0) throw new RpcException({ message: `User with account type DEFAULT can have only 1 app`, status: HttpStatus.BAD_REQUEST })

        user["apps"].forEach((el: App) => {
            if (el.name === dto.name) throw new RpcException({ message: `App with provided name successfly exsists!`, status: HttpStatus.CONFLICT })
        })

        const secretKey = v4()

        const app = await this.prisma.app.create({
            data: {
                userId,
                name: dto.name,
                secretKey
            }
        })

        this.logger.log(`Succesfly created user application`)

        return app
    }

    public async update(dto: UpdateAppDto, userId: number) {
        if (!await this.prisma.app.findUnique({ where: { id: dto.appId, userId } })) throw new RpcException({ message: `App with provided id is not founded!`, status: HttpStatus.NOT_FOUND })

        const updateFields = {}

        if (dto.name) updateFields["name"] = dto.name
        if (dto.isNeedResetToken) updateFields["secretKey"] = v4()

        const updatedApplication = await this.prisma.app.update({
            where: {
                id: dto.appId,
                userId
            },
            data: {
                ...updateFields
            }
        })

        this.logger.log(`Successfly updated user application`)

        return updatedApplication
    }

    public async delete(appId: number, userId: number) {
        const app = await this.prisma.app.findUnique({
            where: {
                id: appId,
                userId
            }
        })

        if (!app) throw new RpcException({ message: `App is not founded!`, status: HttpStatus.NOT_FOUND })

        await this.prisma.app.delete({
            where: {
                id: appId,
                userId
            }
        })

        this.logger.log(`Successfly deleted user application!`)
    }

    public async createConnect(dto: CreateConnectDto, userId: number) {
        const app = await this.prisma.app.findUnique({
            where: {
                id: dto.appId,
                userId
            },
            include: {
                storage: true
            }
        })
        const storage = await this.prisma.storage.findUnique({
            where: {
                name_userId: {
                    name: dto.storageName,
                    userId
                }
            }
        })

        if (!app) throw new RpcException({ message: `App is not founded`, status: HttpStatus.NOT_FOUND })
        if (!storage) throw new RpcException({ message: `Storage is not founded`, status: HttpStatus.NOT_FOUND })
        if (app.storage || storage.appId) throw new RpcException({ message: `Application/Storage already has connect to storage/application!`, status: HttpStatus.BAD_REQUEST })
        if (storage.type !== StorageTypesEnum.DEVELOPER) throw new RpcException({ message: `Storage type is not a DEVELOPER`, status: HttpStatus.BAD_REQUEST })

        const connect = await this.prisma.app.update({
            where: {
                id: dto.appId,
                userId
            },
            data: {
                storage: {
                    connect: {
                        name_userId: {
                            name: dto.storageName,
                            userId
                        }
                    }
                }
            },
            include: {
                storage: true
            }
        })

        this.logger.log(`Successfly connect app to storage`)

        return connect
    }

    public async disconnect(appId: number, userId: number) {
        const app = await this.prisma.app.findUnique({
            where: {
                id: appId,
                userId
            },
            include: {
                storage: true
            }
        })

        if (!app) throw new RpcException({ message: `App is not founded`, status: HttpStatus.NOT_FOUND })
        if (!app.storage) throw new RpcException({ message: `App is not has connected storage`, status: HttpStatus.BAD_REQUEST })

        await this.prisma.app.update({
            where: {
                id: appId,
                userId
            },
            data: {
                storage: {
                    disconnect: true
                }
            }
        })

        this.logger.log(`Success disconnect storage from user app`)
    }

    public async getFile(developer: Developer, fileName: string) {
        await this.checkAppHaveStorage(developer.applicationId, developer.userId)
        
        const observableStream = this.fileClient.send({ cmd: "get_file_by_developer_cmd" }, { userId: developer.userId, appId: developer.applicationId, fileName })

        this.logger.log(`Successfly getted file from application`)
        
        return observableStream
    }

    public async uploadFile(developer: Developer, file: Express.Multer.File) {
        await this.checkAppHaveStorage(developer.applicationId, developer.userId)

        const app = await this.prisma.app.findUnique({
            where: {
                id: developer.applicationId,
                userId: developer.userId
            },
            include: {
                storage: true
            }
        })

        const uploadedFile = await firstValueFrom(this.fileClient.send<File>({ cmd: "upload_file_cmd" }, { dto: { storageName: app.storage.name, file }, file, userId: developer.userId}))

        this.logger.log(`Successfly uploaded file from application`)

        return uploadedFile
    }

    public async deleteFile(developer: Developer, fileName: string) {
        await this.checkAppHaveStorage(developer.applicationId, developer.userId)
        this.fileClient.emit("Delete_file_by_developer_event", { userId: developer.userId, appId: developer.applicationId, fileName })

        this.logger.log(`Successfly deleted file`)
    }
}
