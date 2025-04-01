import { Controller } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';

@Controller()
export class StorageController {
  public constructor(private readonly storageService: StorageService) {}

  @MessagePattern({ cmd: "get_by_name_cmd" })
  public async getByName(@Payload() { name, userId }: { name: string, userId: number }) {
    return await this.storageService.getByName(name, userId)
  }

  @MessagePattern({ cmd: "create_cmd" })
  public async create(@Payload() { dto, userId }: { dto: CreateStorageDto, userId: number }) {
    return await this.storageService.create(dto, userId)
  }

  @MessagePattern({ cmd: "update_cmd" })
  public async update(@Payload() { dto, userId }: { dto: UpdateStorageDto, userId: number }) {
    return await this.storageService.update(dto, userId)
  }

  @MessagePattern({ cmd: "delete_cmd" })
  public async delete(@Payload() { name, userId }: { name: string, userId: number }) {
    return await this.storageService.delete(name, userId)
  }
}
