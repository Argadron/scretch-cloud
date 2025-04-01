import { Body, Controller, Delete, Get, Header, HttpCode, HttpStatus, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { FileService } from "./file.service";
import { Auth } from "@decorators/auth.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadFileDto } from "./dto/upload-file.dto";
import { CurrentUser } from "@decorators/user.decorator";
import { Response } from "express";

@Controller(`file`)
@ApiTags(`File Controller`)
@Auth()
export class FileController {
    public constructor(private readonly fileService: FileService) {}

    @ApiOperation({ summary: `Upload file` })
    @ApiCreatedResponse({ description: `File uploaded succefly` })
    @ApiBadRequestResponse({ description: `File size > storage limit or bad file type` })
    @ApiUnauthorizedResponse({ description: `No access token / token invalid` })
    @ApiNotFoundResponse({ description: "Storage to upload file not founded" })
    @ApiBearerAuth()
    @ApiConsumes(`multipart/form-data`)
    @Post(`/upload`)
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor(`file`))
    public async upload(@Body() dto: UploadFileDto, @UploadedFile() file: Express.Multer.File, @CurrentUser(`id`) userId: number) {
        return await this.fileService.upload(dto, file, userId)
    }

    @ApiOperation({ summary: "Get file" })
    @ApiOkResponse({ description: `File getted successfly` })
    @ApiNotFoundResponse({ description: `File is not found` })
    @ApiUnauthorizedResponse({ description: `No access token / token invalid` })
    @ApiBearerAuth()
    @Header(`Content-Type`, "application/octet-stream")
    @Get(`/get/:name`)
    @HttpCode(HttpStatus.OK)
    public async getFile(@CurrentUser(`id`) userId: number, @Param(`name`) fileName: string, @Res() res: Response) {
        return await this.fileService.getFile(userId, fileName, res)
    }

    @ApiOperation({ summary: "Delete file from storage" })
    @ApiNoContentResponse({ description: `File successfly deleted` })
    @ApiNotFoundResponse({ description: `File is not found` })
    @ApiUnauthorizedResponse({ description: `No access token / token invalid` })
    @ApiBearerAuth()
    @Delete(`/delete/:name`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteFile(@CurrentUser(`id`) userId: number, @Param(`name`) fileName: string) {
        return await this.fileService.deleteFile(userId, fileName)
    }
}