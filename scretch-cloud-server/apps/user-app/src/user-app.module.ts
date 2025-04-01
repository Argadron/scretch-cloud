import { Module } from '@nestjs/common';
import { UserAppController } from './user-app.controller';
import { UserAppService } from './user-app.service';
import { DatabaseModule } from '@app/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfigModule, AppConfigService } from '@app/app-config';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    ClientsModule.registerAsync([
      {
        name: "FILE_CLIENT",
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (config: AppConfigService) => ({
          transport: Transport.TCP,
          options: {
            port: config.getClientsConfig("fileClientPort")
          }
        })
      },
      {
        name: "USER_CLIENT",
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (config: AppConfigService) => ({
          transport: Transport.TCP,
          options: {
            port: config.getClientsConfig("usersClientPort")
          }
        })
      }
    ])
  ],
  controllers: [UserAppController],
  providers: [UserAppService],
})
export class UserAppModule {}
