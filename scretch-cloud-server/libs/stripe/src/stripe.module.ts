import { DynamicModule, Global, Module } from "@nestjs/common";
import { StripeModuleOptions, StripeModuleOptionsAsync } from "./types";
import { createStripeProvider, createStripeProviderAsync } from "./stripe.providers";

@Module({

})
@Global()
export class StripeModule {
    public static forRoot(options: StripeModuleOptions): DynamicModule {
        const stripeProvider = createStripeProvider(options)

        return {
            module: StripeModule,
            providers: [stripeProvider],
            exports: [stripeProvider],
        }
    }

    public static forRootAsync(options: StripeModuleOptionsAsync): DynamicModule {
        return {
            module: StripeModule,
            imports: options.imports || [],
            providers: [createStripeProviderAsync(options)],
            exports: [createStripeProviderAsync(options)],
            global: true,
        }
    }
}