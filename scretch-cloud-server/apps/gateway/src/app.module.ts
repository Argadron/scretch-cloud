import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { DomainModule } from './domain/domain.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfigModule, AppConfigService } from '@app/app-config';

@Module({
  imports: [
    CoreModule, 
    DomainModule, 
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: "USERS_CLIENT",
          useFactory: (config: AppConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: config.getClientsConfig("usersClientPort") as number
            }
          }),
          imports: [AppConfigModule],
          inject: [AppConfigService]
        },
        {
          name: "PAYMENT_CLIENT",
          useFactory: (config: AppConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: config.getClientsConfig("paymentClientPort") as number
            }
          }),
          imports: [AppConfigModule],
          inject: [AppConfigService]
        },
        {
          name: "STORAGE_CLIENT",
          useFactory: (config: AppConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: config.getClientsConfig("storageClientPort") as number
            }
          }),
          imports: [AppConfigModule],
          inject: [AppConfigService]
        },
        {
          name: "FILE_CLIENT",
          useFactory: (config: AppConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: config.getClientsConfig("fileClientPort") as number
            }
          }),
          imports: [AppConfigModule],
          inject: [AppConfigService]
        },
        {
          name: "USER_APP_CLIENT",
          useFactory: (config: AppConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: config.getClientsConfig("userAppClientPort") as number
            }
          }),
          imports: [AppConfigModule],
          inject: [AppConfigService]
        },
        {
          name: "AUTH_CLIENT",
          useFactory: (config: AppConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: config.getClientsConfig("authClientPort") as number
            }
          }),
          imports: [AppConfigModule],
          inject: [AppConfigService]
        }
      ]
    })
  ]
})
export class AppModule {}