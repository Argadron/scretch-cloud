import { ApiProperty } from "@nestjs/swagger";
import { StorageTypesEnum } from "@prisma/client";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStorageDto {
    @ApiProperty({ description: "Storage name" })
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @ApiProperty({ description: "Storage type", enum: StorageTypesEnum })
    @IsNotEmpty()
    @IsEnum(StorageTypesEnum)
    readonly type: StorageTypesEnum

    @ApiProperty({ description: "Storage size in bytes" })
    @IsNumber()
    @IsNotEmpty()
    readonly size: number

    @ApiProperty({ description: "Storage public/private type" })
    @IsNotEmpty()
    @IsBoolean()
    publicType: boolean
}