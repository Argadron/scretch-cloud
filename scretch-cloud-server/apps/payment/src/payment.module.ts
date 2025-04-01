import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { DatabaseModule } from '@app/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { StripeModule } from '@app/stripe';
import { AppConfigModule, AppConfigService } from '@app/app-config';

@Module({
  imports: [
    DatabaseModule,
    StripeModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (config: AppConfigService) => ({ apiKey: config.getStripeConfig("stripe_api_key") as string }),
      inject: [AppConfigService]
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          imports: [AppConfigModule],
          inject: [AppConfigService],
          name: "USERS_CLIENT",
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
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
