import { NestFactory } from '@nestjs/core';
import { FileModule } from './file.module';
import { MicroserviceOptions, Transport, TcpOptions } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(FileModule, {
    transport: Transport.TCP,
    options: {
      port: +process.env.FILE_CLIENT_PORT
    }
  } as TcpOptions);

  await app.listen();
}
bootstrap();
