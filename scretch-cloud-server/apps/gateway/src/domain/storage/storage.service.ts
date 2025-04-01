import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Storage } from "@prisma/client";
import { firstValueFrom } from "rxjs";
import { CreateStorageDto } from "./dto/create-storage.dto";
import { UpdateStorageDto } from "./dto/update-storage.dto";

@Injectable()
export class StorageService {
    public constructor(
        @Inject("STORAGE_CLIENT") private readonly storageClient: ClientProxy
    ) {}

    public async getByName(name: string, userId: number) {
        return await firstValueFrom(this.storageClient.send<Storage, { name: String, userId: Number }>({ cmd: "get_by_name_cmd" }, { name, userId }))
    }

    public async create(dto: CreateStorageDto, userId: number) {
        return await firstValueFrom(this.storageClient.send<Storage, { dto: CreateStorageDto, userId: number }>({ cmd: "create_cmd" }, { dto, userId }))
    }

    public async update(dto: UpdateStorageDto, userId: number) {
        return await firstValueFrom(this.storageClient.send<Storage, { dto: UpdateStorageDto, userId: number }>({ cmd: "update_cmd" }, { dto, userId }))
    }

    public async delete(name: string, userId: number) {
        return await firstValueFrom(this.storageClient.send<Storage, { name: String, userId: Number }>({ cmd: "delete_cmd" }, { name, userId }))
    }
}