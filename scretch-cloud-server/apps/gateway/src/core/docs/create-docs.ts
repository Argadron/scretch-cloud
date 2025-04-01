import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppConfigService, SwaggerConfig } from "@app/app-config";

export function createDocumentation(app: INestApplication, appConfigService: AppConfigService) {
    const config = appConfigService.getSwaggerConfig() as SwaggerConfig

    const builder = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .addBearerAuth({
        type: "http",
        bearerFormat: "JWT",
        in: "header",
        scheme: "bearer",
        name: "JWT",
        description: "Enter your jwt access token"
    })
    .addCookieAuth(config.refresh_token_name)
    .addApiKey({ 
        type: "apiKey", 
        in: "header",
        name: "X-API-KEY" 
    }, `API-AUTH`)
    .build()

    const docs = SwaggerModule.createDocument(app, builder)
    SwaggerModule.setup(config.path, app, docs)
}