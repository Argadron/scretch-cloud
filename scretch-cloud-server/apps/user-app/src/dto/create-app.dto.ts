import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAppDto {
    @ApiProperty({ description: "Name of app" })
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}