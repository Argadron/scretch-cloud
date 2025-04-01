import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AppConfigModule, AppConfigService } from '@app/app-config';

@Module({
  imports: [
    JwtModule.registerAsync({
    imports: [AppConfigModule],
    useFactory: (config: AppConfigService) => ({
      secret: config.getJwtConfig("secret") as string
    }),
    inject: [AppConfigService]
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
