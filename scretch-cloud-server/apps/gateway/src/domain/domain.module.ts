import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module';
import { FileModule } from "./file/file.module";
import { StorageModule } from "./storage/storage.module";
import { PaymentModule } from "./payment/payment.module";
import { UserAppModule } from "./user-app/user-app.module";

@Module({
    imports: [AuthModule, FileModule, StorageModule, PaymentModule, UserAppModule]
})
export class DomainModule {}