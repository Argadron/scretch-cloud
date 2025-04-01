import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { MicroserviceOptions, TcpOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentModule, {
    transport: Transport.TCP,
    options: {
      port: +process.env.PAYMENT_CLIENT_PORT
    }
  } as TcpOptions);

  await app.listen();
}
bootstrap();
