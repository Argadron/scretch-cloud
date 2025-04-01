import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AppConfigModule } from "@app/app-config";

@Module({
    imports: [
        PrismaModule, 
        AppConfigModule
    ],
})
export class CoreModule {}