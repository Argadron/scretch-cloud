import { Controller } from '@nestjs/common';
import { UserAppService } from './user-app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import { CreateConnectDto } from './dto/create-connect.dto';
import { Developer } from './interfaces';

@Controller()
export class UserAppController {
  public constructor(private readonly userAppService: UserAppService) {}

  @MessagePattern({ cmd: "get_all_apps_cmd" })
  public async getAll(@Payload() { userId }: { userId: number }) {
    return await this.userAppService.getAll(userId)
  }

  @MessagePattern({ cmd: "create_app_cmd" })
  public async create(@Payload() { dto, userId }: { dto: CreateAppDto, userId: number }) {
    return await this.userAppService.create(dto, userId)
  }

  @MessagePattern({ cmd: "update_app_cmd" })
  public async update(@Payload() { dto, userId }: { dto: UpdateAppDto, userId: number }) {
    return await this.userAppService.update(dto, userId)
  }

  @EventPattern("Delete_app_event")
  public async delete(@Payload() { appId, userId }: { appId: number, userId: number }) {
    return await this.userAppService.delete(appId, userId)
  }

  @MessagePattern({ cmd: "create_connect_cmd" })
  public async createConnect(@Payload() { dto, userId }: { dto: CreateConnectDto, userId: number }) {
    return await this.userAppService.createConnect(dto, userId)
  }

  @EventPattern("Disconnect_event")
  public async disconnect(@Payload() { appId, userId }: { appId: number, userId: number }) {
    return await this.userAppService.disconnect(appId, userId)
  }

  @MessagePattern({ cmd: "get_file_cmd" })
  public async getFile(@Payload() { developer, fileName }: { developer: Developer, fileName: string }) {
    return await this.userAppService.getFile(developer, fileName)
  }

  @MessagePattern({ cmd: "upload_file_cmd" })
  public async uploadFile(@Payload() { developer, file }: { developer: Developer, file: Express.Multer.File }) {
    return await this.userAppService.uploadFile(developer, file)
  }

  @EventPattern("Delete_file_event")
  public async deleteFile(@Payload() { developer, fileName }: { developer: Developer, fileName: string }) {
    return await this.userAppService.deleteFile(developer, fileName)
  }
}
