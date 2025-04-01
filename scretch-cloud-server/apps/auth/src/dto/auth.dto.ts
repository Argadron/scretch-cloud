import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    public readonly username: string;

    @IsString()
    @IsNotEmpty()
    @Length(8, 30)
    @ApiProperty()
    public readonly password: string;
}