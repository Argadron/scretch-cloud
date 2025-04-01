import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { createDocumentation } from './core/docs/create-docs';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RpcExceptionFiler } from './shared/filters/rpc-exception.filter';
import { AppConfigService, ServerConfig } from '@app/app-config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const appConfig = app.get(AppConfigService)
  const serverConfig = appConfig.getServerConfig() as ServerConfig
  
  app.enableCors({
    origin: serverConfig.api_client_url,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["set-cookie", "x-api-key"],
    credentials: true,
  })
  app.setGlobalPrefix(serverConfig.prefix)
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  app.useGlobalFilters(new RpcExceptionFiler())

  createDocumentation(app, appConfig)

  await app.listen(serverConfig.port, serverConfig.host);
}
bootstrap();
