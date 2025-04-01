import { Module } from "@nestjs/common";
import { UserAppController } from "./user-app.controller";
import { UserAppService } from "./user-app.service";

@Module({
    controllers: [UserAppController],
    providers: [UserAppService],
    exports: [UserAppService]
})
export class UserAppModule {}