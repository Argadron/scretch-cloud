import { DatabaseService } from '@app/database';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createReadStream, createWriteStream, existsSync, mkdirSync, ReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { FileType } from './types';
import { extname, join } from 'path';
import { v4 } from 'uuid';
import { File, FileTypeEnum } from '@prisma/client';
import { UploadFileDto } from './dto/upload-file.dto';
import { FILE_TYPE_STORAGE } from './constants';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { AppConfigService } from '@app/app-config';

@Injectable()
export class FileService implements OnModuleInit {
    private readonly profileAllowedFileTypes = [".png", ".jpg", ".webp"] 
    private readonly storageAllowedFileTypes = [...this.profileAllowedFileTypes, ".mp4", ".mp3", ".txt", ".json"]
    private baseDirUrl: string
    private readonly logger: Logger = new Logger(FileService.name)
    private NODE_ENV: string;

    public constructor(
      private readonly prisma: DatabaseService,
      private readonly appConfig: AppConfigService
    ) {
        this.NODE_ENV = appConfig.getServerConfig("node_env") as string
        this.onModuleInit()
    }

    public onModuleInit() {
        if (process.cwd().includes(`dist`)) {
            this.baseDirUrl = `../uploads`
        }
        else {
            this.baseDirUrl = `./uploads`
        } 
 
        if (!existsSync(this.baseDirUrl)) {
            mkdirSync(this.baseDirUrl)
            mkdirSync(this.baseDirUrl + `/storage`)
            mkdirSync(this.baseDirUrl + `/profile`)
        }
    }

    private validateFileType(fileType: FileType, fileOriginalName: string): boolean {
        return fileType === `profile` ? this.profileAllowedFileTypes.includes(extname(fileOriginalName)) ? true : false : this.storageAllowedFileTypes.includes(extname(fileOriginalName)) ? true : false
    }

    private async downoloadToStorage(fileType: FileType, file: Express.Multer.File): Promise<string> {
        if (!this.validateFileType(fileType, file.originalname)) throw new RpcException({ message: `File type not allowed`, status: HttpStatus.BAD_REQUEST })

        const fileName = v4()
        const filePath = `${this.baseDirUrl}/${fileType}/${fileName}${extname(file.originalname)}`
        
        if (this.NODE_ENV !== "test") {
            const stream = createWriteStream(filePath)

            stream.write(Buffer.from(file.buffer["data"]))
            stream.end()
        }

        return fileName
    }

    private calcNewStorageSizeAndThrowOnLimit(storageFiles: File[], newFileSize: number, storageSize: number): number {
        const currentStorageSize = storageFiles.reduce((accum, elem) => {
            return accum + elem.fileSize
        }, 0)

        const newSize = currentStorageSize + newFileSize

        if (newSize > storageSize) throw new RpcException({ message: `New storage size > than limit`, status: HttpStatus.BAD_REQUEST })

        return newSize
    }

    private async getFilePathByNameOrThrow(fileName: string, userId: number) {
        const file = await this.prisma.file.findUnique({
            where: {
                fileName,
                userId
            }
        })

        if (!file) throw new RpcException({ message: `File is not found!`, status: HttpStatus.NOT_FOUND })

        return join(this.baseDirUrl, file.fileType === `PROFILE` ? "profile" : "storage", `${file.fileName}${extname(file.fileOriginalName)}`)
    }

    private async checkAppContainsFile(appId: number, fileName: string, userId: number) {
        const app = await this.prisma.app.findUnique({
            where: {
                id: appId,
                userId
            },
            include: {
                storage: {
                    include: {
                        files: true
                    }
                }
            }
        })

        let check = false

        app.storage.files.forEach(el => {
            if (el.fileName === fileName) check = true
        })

        if (!check) throw new RpcException({ message: `File not found in provided app storage`, status: HttpStatus.NOT_FOUND })
    }

    public async upload(dto: UploadFileDto, file: Express.Multer.File, userId: number) {
        if (!file) throw new RpcException({ message: `File must be provided`, status: HttpStatus.BAD_REQUEST })
        if (!this.validateFileType(FILE_TYPE_STORAGE, file.originalname)) throw new RpcException({ message: `File type is invalid!`, status: HttpStatus.BAD_REQUEST })

        const storage = await this.prisma.storage.findUnique({
            where: {
                name_userId: {
                    name: dto.storageName,
                    userId
                }
            },
            include: {
                files: true
            }
        })

        if (!storage) throw new RpcException({ message: `Storage with provided name is not found!`, status: HttpStatus.NOT_FOUND })
        
        this.calcNewStorageSizeAndThrowOnLimit(storage.files, file.size, storage.size)

        const fileName = await this.downoloadToStorage(FILE_TYPE_STORAGE, file)

        const createdFile = await this.prisma.file.create({
            data: {
                storageId: storage.id,
                fileName,
                fileOriginalName: file.originalname,
                fileSize: file.size,
                fileType: FileTypeEnum.STORAGE,
                userId
            }
        })

        this.logger.log(`Success upload file`)

        return createdFile
    }

    public async getFile(userId: number, fileName: string) {
        const filePath = await this.getFilePathByNameOrThrow(fileName, userId)
        const { fileOriginalName } = await this.prisma.file.findUnique({ where: { fileName }, select: { fileOriginalName: true } })

        let stream: ReadStream;

        if (this.NODE_ENV !== "test") stream = createReadStream(filePath)

        this.logger.log(`Success get file`)

        return new Observable(subscriber => {
            const chunks = []

            stream.addListener("data", (chunk) => chunks.push(chunk))
            stream.addListener("error", (err) => subscriber.error(err))
            stream.addListener("end", () => {
                subscriber.next({ fileOriginalName, file: chunks })
                subscriber.complete()
            })
        })
    }

    public async getFileByDeveloper(userId: number, appId: number, fileName: string) {
        await this.checkAppContainsFile(appId, fileName, userId)

        return await this.getFile(userId, fileName)
    }

    public async deleteFile(userId: number, fileName: string) {
        const filePath = await this.getFilePathByNameOrThrow(fileName, userId)

        await this.prisma.file.delete({
            where: {
                fileName,
                userId
            }
        })
        this.NODE_ENV === `test` ? null : await unlink(filePath)
        this.logger.log(`Success deleted file`)
    }

    public async deleteFileByDeveloper(userId: number, appId: number, fileName: string) {
        await this.checkAppContainsFile(appId, fileName, userId)
        await this.deleteFile(userId, fileName)

        this.logger.log(`Successfly deleted file from application`)
    }
}
