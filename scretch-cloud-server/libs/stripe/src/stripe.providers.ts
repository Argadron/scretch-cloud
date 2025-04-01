import { Provider } from "@nestjs/common";
import { StripeModuleOptions, StripeModuleOptionsAsync } from "./types";
import { STRIPE_CLIENT } from "./constants";
import Stripe from "stripe";

export function createStripeProvider(options: StripeModuleOptions): Provider {
    return {
        provide: STRIPE_CLIENT,
        useValue: new Stripe(options.apiKey)
    }
}

export function createStripeProviderAsync(options: StripeModuleOptionsAsync): Provider {
    return {
        provide: STRIPE_CLIENT,
        inject: options.inject || [],
        useFactory: (...injectors) => {
            const { apiKey } = options.useFactory(...injectors) as StripeModuleOptions 

            return new Stripe(apiKey)
        }
    }
}