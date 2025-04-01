import { NestFactory } from '@nestjs/core';
import { UserAppModule } from './user-app.module';
import { MicroserviceOptions, TcpOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserAppModule, {
    transport: Transport.TCP,
    options: {
      port: +process.env.USER_APP_CLIENT_PORT
    }
  } as TcpOptions);
  
  await app.listen();
}
bootstrap();
