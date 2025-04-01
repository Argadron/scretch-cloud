import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UploadFileDto {
    @ApiProperty({ description: "Storage name to upload file" })
    @IsString()
    @IsNotEmpty()
    readonly storageName: string;

    @ApiProperty({ description: "File to upload", type: "string", format: "binary" })
    readonly file: Express.Multer.File
}