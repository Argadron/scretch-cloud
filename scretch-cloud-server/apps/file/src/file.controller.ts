import { Controller } from '@nestjs/common';
import { FileService } from './file.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller()
export class FileController {
  public constructor(private readonly fileService: FileService) {}

  @MessagePattern({ cmd: "upload_file_cmd" })
  public async upload(@Payload() { dto, file, userId }: { dto: UploadFileDto, file: Express.Multer.File, userId: number }) {
    return await this.fileService.upload(dto, file, userId)
  }

  @MessagePattern({ cmd: "get_file_cmd" })
  public async getFile(
    @Payload() { userId, fileName }: { userId: number, fileName: string }
  ) {
    return await this.fileService.getFile(userId, fileName)
  }

  @EventPattern(`Delete_file_event`)
  public async deleteFile(@Payload() { userId, fileName }: { userId: number, fileName: string }) {
    return await this.fileService.deleteFile(userId, fileName)
  }

  @MessagePattern({ cmd: "get_file_by_developer_cmd" })
  public async getFileByDeveloper(@Payload() { userId, appId, fileName }: { userId: number, appId: number, fileName: string }) {
    return await this.fileService.getFileByDeveloper(userId, appId, fileName)
  }

  @EventPattern("Delete_file_by_developer_event")
  public async deleteFileByDeveloper(@Payload() { userId, appId, fileName }: { userId: number, appId: number, fileName: string }) {
    return await this.fileService.deleteFileByDeveloper(userId, appId, fileName)
  }

  @MessagePattern({ cmd: "get_public_file_cmd" })
  public async getPublicFile(@Payload() { fileName }: { fileName: string }) {
    return await this.fileService.getPublicFile(fileName)
  }
}
