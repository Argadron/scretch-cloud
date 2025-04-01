import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { DatabaseModule } from '@app/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfigModule, AppConfigService } from '@app/app-config';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    ClientsModule.registerAsync({
      clients: [
        {
          name: "USERS_CLIENT",
          imports: [AppConfigModule],
          inject: [AppConfigService],
          useFactory: (config: AppConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: config.getClientsConfig("usersClientPort")
            }
          })
        }
      ]
    })
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
