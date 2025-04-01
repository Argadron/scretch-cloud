import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Res, Header, UseInterceptors, UploadedFile } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiConsumes } from "@nestjs/swagger";
import { UserAppService } from "./user-app.service";
import { Auth } from "@decorators/auth.decorator";
import { CurrentUser } from "@decorators/user.decorator";
import { CreateAppDto } from "./dto/create-app.dto";
import { UpdateAppDto } from "./dto/update-app.dto";
import { CreateConnectDto } from "./dto/create-connect.dto";
import { DeveloperAuth } from "@decorators/developer.auth.decorator";
import { CurrentDeveloper } from "@decorators/developer.decorator";
import { Developer } from "./interfaces";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller(`/application`)
@ApiTags(`Users Apps Controller`)
export class UserAppController {
    public constructor(private readonly userAppService: UserAppService) {}

    @ApiOperation({ summary: "Get all user applications" })
    @ApiOkResponse({ description: "Successfly getted applications" })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiBearerAuth()
    @Auth()
    @Get(`/all`)
    @HttpCode(HttpStatus.OK)
    public async getAll(@CurrentUser(`id`) userId: number) {
        return await this.userAppService.getAll(userId)
    }

    @ApiOperation({ summary: "Create a new application" })
    @ApiCreatedResponse({ description: "Successfly created application" })
    @ApiBadRequestResponse({ description: "Apps limit / bad dto data" })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiConflictResponse({ description: "App with provided name already exsists" })
    @ApiBearerAuth()
    @Auth()
    @Post(`/create`)
    @HttpCode(HttpStatus.CREATED)
    public async create(@Body() dto: CreateAppDto, @CurrentUser(`id`) userId: number) {
        return await this.userAppService.create(dto, userId)
    }

    @ApiOperation({ summary: "Edit application" })
    @ApiOkResponse({ description: "Successfly updated application" })
    @ApiBadRequestResponse({ description: "Bad dto data" })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiNotFoundResponse({ description: "Application with provided id is not founded!" })
    @ApiConflictResponse({ description: "Conflict application names (new name is exsists)" })
    @ApiBearerAuth()
    @Auth()
    @Put(`/update`)
    @HttpCode(HttpStatus.OK)
    public async update(@Body() dto: UpdateAppDto, @CurrentUser(`id`) userId: number) {
        return await this.userAppService.update(dto, userId)
    }

    @ApiOperation({ summary: "Delete application" })
    @ApiNoContentResponse({ description: "Successfly deleted application" })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiNotFoundResponse({ description: "Application with provided id is not founded!" })
    @ApiBearerAuth()
    @Auth()
    @Delete(`/delete/:id`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async delete(@Param(`id`, ParseIntPipe) appId: number, @CurrentUser(`id`) userId: number) {
        return await this.userAppService.delete(appId, userId)
    }

    @ApiOperation({ summary: "Connect to storage" })
    @ApiOkResponse({ description: "Successfly binded storage to provided app" })
    @ApiBadRequestResponse({ description: "Bad dto data / Storage type is not a DEVELOPMENT / App already has connected storage" })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiNotFoundResponse({ description: "Application / Storage with provided id / name is not founded" })
    @ApiBearerAuth()
    @Auth()
    @Post(`/createConnect`)
    @HttpCode(HttpStatus.OK)
    public async createConnect(@Body() dto: CreateConnectDto, @CurrentUser(`id`) userId: number) {
        return await this.userAppService.createConnect(dto, userId)
    }

    @ApiOperation({ summary: "Disconnect storage from app" })
    @ApiNoContentResponse({ description: "Disconnect success" })
    @ApiBadRequestResponse({ description: "App hasnt exsisting connected storage" })
    @ApiNotFoundResponse({ description: "App with provided id is not founded" })
    @ApiUnauthorizedResponse({ description: "No access token / token invalid" })
    @ApiBearerAuth()
    @Auth()
    @Delete(`/disconnectStorage/:id`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async disconnect(@Param("id", ParseIntPipe) appId: number, @CurrentUser(`id`) userId: number) {
        return await this.userAppService.disconnect(appId, userId)
    }

    @ApiOperation({ summary: "Get file from storage" })
    @ApiOkResponse({ description: "Success getted file" })
    @ApiNotFoundResponse({ description: "File is not founded" })
    @ApiUnauthorizedResponse({ description: "No API-KEY / Key invalid" })
    @ApiSecurity(`API-AUTH`)
    @Get(`/downloadFile/:name`)
    @DeveloperAuth()
    @Header(`Content-Type`, "application/octet-stream")
    @HttpCode(HttpStatus.OK)
    public async downoladFile(@CurrentDeveloper() developer: Developer, @Param(`name`) fileName: string, @Res() res: Response) {
        return await this.userAppService.getFile(developer, fileName, res)
    }

    @ApiOperation({ summary: "Upload file to storage. Provide your file on field 'file'" })
    @ApiOkResponse({ description: "Successfly upload file" })
    @ApiUnauthorizedResponse({ description: `No API-KEY / Key invalid` })
    @ApiSecurity(`API-AUTH`)
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: { 
                    type: "string",
                    format: "binary"
                }
            }
        }
    })
    @ApiConsumes(`multipart/form-data`)
    @Post(`/uploadFile`)
    @DeveloperAuth()
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor(`file`))
    public async uploadFile(@CurrentDeveloper() developer: Developer, @UploadedFile() file: Express.Multer.File) {
        return await this.userAppService.uploadFile(developer, file)
    }

    @ApiOperation({ summary: "Delete file from storage" })
    @ApiNoContentResponse({ description: "Successfly deleted file" })
    @ApiUnauthorizedResponse({ description: "No API-KEY / Key invalid" })
    @ApiNotFoundResponse({ description: "File is not found" })
    @ApiSecurity(`API-AUTH`)
    @Delete(`/deleteFile/:name`)
    @DeveloperAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteFile(@CurrentDeveloper() developer: Developer, @Param(`name`) fileName: string) {
        return await this.userAppService.deleteFile(developer, fileName)
    }
}