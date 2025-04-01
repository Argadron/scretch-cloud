import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { App, File, Storage } from "@prisma/client";
import { firstValueFrom } from "rxjs";
import { CreateAppDto } from "./dto/create-app.dto";
import { UpdateAppDto } from "./dto/update-app.dto";
import { CreateConnectDto } from "./dto/create-connect.dto";
import { Developer } from "./interfaces";
import { Response } from "express";

@Injectable()
export class UserAppService {
    public constructor(
        @Inject("USER_APP_CLIENT") private readonly userAppClient: ClientProxy
    ) {}

    public async getAll(userId: number) {
        return await firstValueFrom(this.userAppClient.send<App[] | null, { userId: Number }>({ cmd: "get_all_apps_cmd" }, { userId }))
    }

    public async create(dto: CreateAppDto, userId: number) {
        return await firstValueFrom(this.userAppClient.send<App, { dto: CreateAppDto, userId: Number }>({ cmd: "create_app_cmd" }, { dto, userId }))
    }

    public async update(dto: UpdateAppDto, userId: number) {
        return await firstValueFrom(this.userAppClient.send<App, { dto: UpdateAppDto, userId: Number }>({ cmd: "update_app_cmd" }, { dto, userId }))
    }

    public async delete(appId: number, userId: number) {
        return await firstValueFrom(this.userAppClient.emit<void, { appId: Number, userId: Number }>("Delete_app_event", { appId, userId }))
    }

    public async createConnect(dto: CreateConnectDto, userId: number) {
        return await firstValueFrom(this.userAppClient.send<Storage, { dto: CreateConnectDto, userId: Number }>({ cmd: "create_connect_cmd" }, { dto, userId }))
    }

    public async disconnect(appId: number, userId: number) {
        return await firstValueFrom(this.userAppClient.emit<void, { appId: Number, userId: Number }>(`Disconnect_event`, { appId, userId }))
    }

    public async getFile(developer: Developer, fileName: string, res: Response) {
        const observableStream = this.userAppClient.send<{ fileOriginalName: string, file: [{ type: String, data: number[] }]}, { developer: Developer, fileName: String }>({ cmd: "get_file_cmd" }, { developer, fileName })

        observableStream.subscribe({
            next: (file) => {
                res.header("Content-Disposition", file.fileOriginalName)
                res.end(Buffer.from(file.file[0].data))
            }
        })
    }

    public async uploadFile(developer: Developer, file: Express.Multer.File) {
        return await firstValueFrom(this.userAppClient.send<File, { developer: Developer, file: Express.Multer.File }>({ cmd: "upload_file_cmd" }, { developer, file }))
    }

    public async deleteFile(developer: Developer, fileName: string) {
        return await firstValueFrom(this.userAppClient.emit<void, { developer: Developer, fileName: String }>("Delete_file_event", { developer, fileName }))
    }
}