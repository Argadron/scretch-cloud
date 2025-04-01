import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, ClientConfig, JwtConfig, ServerConfig, StorageConfig, StripeConfig, SwaggerConfig } from './interfaces';

@Injectable()
export class AppConfigService {
    private _appConfig: AppConfig

    public constructor(private readonly configService: ConfigService) {
        this._appConfig = {
            serverConifg: {
                host: configService.getOrThrow<string>("SERVER_HOST"),
                port: configService.getOrThrow<number>("SERVER_PORT"),
                node_env: configService.getOrThrow<string>("NODE_ENV"),
                prefix: configService.getOrThrow<string>("APP_PREFIX"),
                api_client_url: configService.getOrThrow<string>("API_CLIENT_URL")
            },
            storageConfig: {
                default_storage_limit: configService.getOrThrow<string>("USERS_DEFAULT_STORAGE_LIMIT"),
                pro_storage_limit: configService.getOrThrow<string>("USERS_PRO_STORAGE_LIMIT")
            },
            jwtConfig: {
                secret: configService.getOrThrow<string>("JWT_SECRET"),
                access_expires: configService.getOrThrow<string>("ACCESS_TOKEN_EXPIRES"),
                refresh_expires: configService.getOrThrow<string>("REFRESH_TOKEN_EXPIRES"),
                refresh_cookie_expires: configService.getOrThrow<string>("REFRESH_TOKEN_COOKIE_EXPIRES")
            },
            stripeConfig: {
                stripe_api_key: configService.getOrThrow<string>("STRIPE_API_KEY"),
                stripe_pro_price: configService.getOrThrow<number>("STRIPE_PRO_SUBSCRIPTION_PRICE")
            },
            swaggerConfig: {
                title: configService.getOrThrow<string>("SWAGGER_TITLE"),
                description: configService.getOrThrow<string>("SWAGGER_DESCRIPTION"),
                version: configService.getOrThrow<string>("SWAGGER_VERSION"),
                path: configService.getOrThrow<string>("SWAGGER_PATH"),
                refresh_token_name: configService.getOrThrow<string>("REFRESH_TOKEN_COOKIE_NAME")
            },
            clientsConfig: {
                usersClientPort: configService.getOrThrow<number>("USERS_CLIENT_PORT"),
                fileClientPort: configService.getOrThrow<number>("FILE_CLIENT_PORT"),
                authClientPort: configService.getOrThrow<number>("AUTH_CLIENT_PORT"),
                paymentClientPort: configService.getOrThrow<number>("PAYMENT_CLIENT_PORT"),
                storageClientPort: configService.getOrThrow<number>("STORAGE_CLIENT_PORT"),
                userAppClientPort: configService.getOrThrow<number>("USER_APP_CLIENT_PORT")
            }
        }
    }

    public getServerConfig(): ServerConfig
    public getServerConfig(value?: keyof ServerConfig): string | number
    public getServerConfig(value?: keyof ServerConfig) {
        return value ? this._appConfig.serverConifg[value] : this._appConfig.serverConifg
    }

    public getSwaggerConfig(): SwaggerConfig
    public getSwaggerConfig(value?: keyof SwaggerConfig): string
    public getSwaggerConfig(value?: keyof SwaggerConfig) {
        return value ? this._appConfig.swaggerConfig[value] : this._appConfig.swaggerConfig
    }

    public getStorageConfig(): StorageConfig
    public getStorageConfig(value?: keyof StorageConfig): string
    public getStorageConfig(value?: keyof StorageConfig) {
        return value ? this._appConfig.storageConfig[value] : this._appConfig.storageConfig
    }

    public getStripeConfig(): StripeConfig 
    public getStripeConfig(value?: keyof StripeConfig): string | number
    public getStripeConfig(value?: keyof StripeConfig) {
        return value ? this._appConfig.stripeConfig[value] : this._appConfig.stripeConfig
    }

    public getClientsConfig(): ClientConfig
    public getClientsConfig(value?: keyof ClientConfig): number
    public getClientsConfig(value?: keyof ClientConfig) {
        return value ? this._appConfig.clientsConfig[value] : this._appConfig.clientsConfig
    }

    public getJwtConfig(): JwtConfig 
    public getJwtConfig(value?: keyof JwtConfig): string
    public getJwtConfig(value?: keyof JwtConfig) {
        return value ? this._appConfig.jwtConfig[value] : this._appConfig.jwtConfig
    }
}