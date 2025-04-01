import { FactoryProvider, ModuleMetadata } from "@nestjs/common"

export type StripeModuleOptions = {
    readonly apiKey: string
}

export type StripeModuleOptionsAsync = Pick<ModuleMetadata, `imports`> & Pick<FactoryProvider<StripeModuleOptions>, `useFactory` | `inject`>