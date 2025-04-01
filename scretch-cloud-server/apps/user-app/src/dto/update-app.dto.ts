import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAppDto {
    @ApiProperty({ description: "New application name" })
    @IsOptional()
    @IsString()
    readonly name?: string; 

    @ApiProperty({ description: "Reset application token" })
    @IsOptional()
    @IsBoolean()
    readonly isNeedResetToken: boolean;

    @ApiProperty({ description: "Application id" })
    @IsNumber()
    @IsNotEmpty()
    readonly appId: number;
}