import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import { MicroserviceOptions, TcpOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(StorageModule, {
    transport: Transport.TCP,
    options: {
      port: +process.env.STORAGE_CLIENT_PORT
    }
  } as TcpOptions);

  await app.listen();
}
bootstrap();
