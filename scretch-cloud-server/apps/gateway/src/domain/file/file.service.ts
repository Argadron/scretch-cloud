import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { UploadFileDto } from "./dto/upload-file.dto";
import { firstValueFrom, Observable } from "rxjs";
import { File } from "@prisma/client";
import { Response } from "express";
import { IFileBodyRequest, IFileBodyRequestDeveloper, IFileStream } from "./interfaces";

@Injectable()
export class FileService {
    public constructor(
        @Inject("FILE_CLIENT") private readonly fileClient: ClientProxy
    ) {}

    private sendFileResponse(fileStream: Observable<IFileStream>, res: Response) {
        fileStream.subscribe({
           next: (file) => { 
               res.header("Content-disposition", `attachment; filename=${file.fileOriginalName}`)
               res.end(Buffer.from(file.file[0].data))
           }
        })
    }

    public async upload(dto: UploadFileDto, file: Express.Multer.File, userId: number) {
        return await firstValueFrom(this.fileClient.send<File, { dto: UploadFileDto, file: Express.Multer.File, userId: Number }>({ cmd: "upload_file_cmd" }, { dto, file, userId }))
    }

    public async getFile(userId: number, fileName: string, res: Response) {
        const observableStream = this.fileClient.send<IFileStream, IFileBodyRequest>({ cmd: "get_file_cmd" }, { userId, fileName })

        this.sendFileResponse(observableStream, res)
    }

    public async deleteFile(userId: number, fileName: string) {
        return await firstValueFrom(this.fileClient.emit<void, IFileBodyRequest>("Delete_file_event", { userId, fileName }))
    }

    public async getFileByDeveloper(userId: number, appId: number, fileName: string, res: Response) {
        const observableStream = this.fileClient.send<IFileStream, IFileBodyRequestDeveloper>({ cmd: "get_file_by_developer_cmd" }, { userId, appId, fileName })

        this.sendFileResponse(observableStream, res)
    }

    public async deleteFileByDeveloper(userId: number, appId: number, fileName: string) {
        return await firstValueFrom(this.fileClient.emit<void, IFileBodyRequestDeveloper>("Delete_file_by_developer_event", { userId, appId, fileName }))
    }

    public async getPublicFile(fileName: string, res: Response) {
        const observableStream = this.fileClient.send<IFileStream, { fileName: String }>({ cmd: "get_public_file_cmd" }, { fileName })

        this.sendFileResponse(observableStream, res)
    }
}