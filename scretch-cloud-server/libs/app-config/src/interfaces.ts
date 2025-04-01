export interface AppConfig {
    readonly serverConifg: ServerConfig;
    readonly clientsConfig: ClientConfig;
    readonly swaggerConfig: SwaggerConfig;
    readonly jwtConfig: JwtConfig;
    readonly storageConfig: StorageConfig;
    readonly stripeConfig: StripeConfig;
}

export interface ServerConfig {
    readonly port: number;
    readonly host: string;
    readonly prefix: string;
    readonly api_client_url: string;
    readonly node_env: string;
}

export interface ClientConfig {
    readonly usersClientPort: number;
    readonly fileClientPort: number;
    readonly storageClientPort: number;
    readonly paymentClientPort: number;
    readonly userAppClientPort: number;
    readonly authClientPort: number;
}

export interface SwaggerConfig {
    readonly refresh_token_name: string;
    readonly title: string;
    readonly description: string;
    readonly version: string;
    readonly path: string;
}

export interface JwtConfig {
    readonly secret: string;
    readonly access_expires: string;
    readonly refresh_expires: string;
    readonly refresh_cookie_expires: string;
}

export interface StorageConfig {
    readonly default_storage_limit: string;
    readonly pro_storage_limit: string;
}

export interface StripeConfig {
    readonly stripe_api_key: string;
    readonly stripe_pro_price: number;
}