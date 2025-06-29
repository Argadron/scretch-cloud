import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { UploadFileDto } from "./dto/upload-file.dto";
import { firstValueFrom } from "rxjs";
import { File } from "@prisma/client";
import { Response } from "express";

@Injectable()
export class FileService {
    public constructor(
        @Inject("FILE_CLIENT") private readonly fileClient: ClientProxy
    ) {}

    public async upload(dto: UploadFileDto, file: Express.Multer.File, userId: number) {
        return await firstValueFrom(this.fileClient.send<File, { dto: UploadFileDto, file: Express.Multer.File, userId: Number }>({ cmd: "upload_file_cmd" }, { dto, file, userId }))
    }

    public async getFile(userId: number, fileName: string, res: Response) {
        const observableStream = this.fileClient.send<{ fileOriginalName: string, file: [{ type: String, data: number[] }]}, { userId: Number, fileName: String }>({ cmd: "get_file_cmd" }, { userId, fileName })

        observableStream.subscribe({
           next: (file) => { 
               res.header("Content-disposition", `attachment; filename=${file.fileOriginalName}`)
               res.end(Buffer.from(file.file[0].data))
           }
        })
    }

    public async deleteFile(userId: number, fileName: string) {
        return await firstValueFrom(this.fileClient.emit<void, { userId: Number, fileName: String }>("Delete_file_event", { userId, fileName }))
    }

    public async getFileByDeveloper(userId: number, appId: number, fileName: string, res: Response) {
        const observableStream = this.fileClient.send<{ fileOriginalName: string, file: [{ type: String, data: number[] }]}, { userId: Number, appId: Number, fileName: String }>({ cmd: "get_file_by_developer_cmd" }, { userId, appId, fileName })

        observableStream.subscribe({
            next: (file) => {
                res.header("Content-Disposition", `attachment; filename=${file.fileOriginalName}`)
                res.end(Buffer.from(file.file[0].data))
            }
        })
    }

    public async deleteFileByDeveloper(userId: number, appId: number, fileName: string) {
        return await firstValueFrom(this.fileClient.emit<void, { userId: Number, appId: Number, fileName: String }>("Delete_file_by_developer_event", { userId, appId, fileName }))
    }
}