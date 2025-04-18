import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateStorageDto {
    @ApiProperty({ description: "A old storage name" })
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ description: "A new storage size" })
    @IsNumber()
    @IsOptional()
    readonly size?: number;

    @ApiProperty({ description: "A new storage name" })
    @IsString()
    @IsOptional()
    readonly newName?: string;
}