import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateConnectDto {
    @ApiProperty({ description: "Storage name to connect" })
    @IsString()
    @IsNotEmpty()
    readonly storageName: string;

    @ApiProperty({ description: "User application id" })
    @IsNumber()
    @IsNotEmpty()
    readonly appId: number
}