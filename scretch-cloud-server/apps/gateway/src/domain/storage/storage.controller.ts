import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { StorageService } from "./storage.service";
import { Auth } from "@decorators/auth.decorator";
import { CreateStorageDto } from "./dto/create-storage.dto";
import { CurrentUser } from "@decorators/user.decorator";
import { UpdateStorageDto } from "./dto/update-storage.dto";

@Controller(`storage`)
@ApiTags(`Storage Controller`)
export class StorageController {
    public constructor(private readonly storageService: StorageService) {}

    @ApiOperation({ summary: "Get details info about one storage" })
    @ApiOkResponse({ description: "Successfly getted info" })
    @ApiUnauthorizedResponse({ description: "No access token / invalid token" })
    @ApiNotFoundResponse({ description: "Storage is not founded" })
    @ApiBearerAuth()
    @Auth()
    @Get(`/by-name/:name`)
    @HttpCode(HttpStatus.OK)
    public async getByName(@Param(`name`) name: string, @CurrentUser("id") userId: number) {
        return await this.storageService.getByName(name, userId)
    }

    @ApiOperation({ summary: "Create a new storage" })
    @ApiCreatedResponse({ description: "Successfly created storage" })
    @ApiBadRequestResponse({ description: `Limit storage sizes / Bad dto data` })
    @ApiUnauthorizedResponse({ description: "No access token / invalid token" })
    @ApiConflictResponse({ description: "Storage with provided name already exsists!" })
    @ApiBearerAuth()
    @Auth()
    @Post(`/create`)
    @HttpCode(HttpStatus.CREATED)
    public async create(@Body() dto: CreateStorageDto, @CurrentUser(`id`) userId: number) {
        return await this.storageService.create(dto, userId)
    }

    @ApiOperation({ summary: "Update a storage" })
    @ApiOkResponse({ description: "Success update storage" })
    @ApiBadRequestResponse({ description: "Limit storage size / Bad dto data" })
    @ApiUnauthorizedResponse({ description: "No access token / invalid token" })
    @ApiNotFoundResponse({ description: "Storage with provided name was not founded" })
    @ApiConflictResponse({ description: "New storage name already exsists!" })
    @ApiBearerAuth()
    @Auth()
    @Put(`/update`)
    @HttpCode(HttpStatus.OK)
    public async update(@Body() dto: UpdateStorageDto, @CurrentUser(`id`) userId: number) {
        return await this.storageService.update(dto, userId)
    }

    @ApiOperation({ summary: "Delete a storage" })
    @ApiOkResponse({ description: "Success delete storage" })
    @ApiUnauthorizedResponse({ description: "No access token / invalid token" })
    @ApiNotFoundResponse({ description: "Storage with provided name was not founded" })
    @ApiBearerAuth()
    @Auth()
    @Delete(`/delete/:name`)
    @HttpCode(HttpStatus.OK)
    public async delete(@Param(`name`) name: string, @CurrentUser(`id`) userId: number) {
        return await this.storageService.delete(name, userId)
    }

    @ApiOperation({ summary: "Get a public storage by url" })
    @ApiOkResponse({ description: "Successfly getted public storage" })
    @ApiNotFoundResponse({ description: "Storage is not founded!" })
    @ApiForbiddenResponse({ description: "Storage hasn`t public access type" })
    @Get(`/get-public/:id`)
    @HttpCode(HttpStatus.OK)
    public async getPublic(@Param("id") id: string) {
        return await this.storageService.getPublic(id)
    }
}