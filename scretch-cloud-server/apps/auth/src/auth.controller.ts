import { Controller} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthDto } from './dto/auth.dto';

@Controller()
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: "register_cmd" })
  public async register(@Payload() { username, password }: { username: string, password: string }) {
    return await this.authService.register({ username, password })
  }

  @MessagePattern({ cmd: "login_cmd" })
  public async login(@Payload() { username, password }: { username: string, password: string }) {
    return await this.authService.login({ username, password })
  }

  @MessagePattern({ cmd: "refresh_cmd" })
  public async refresh(@Payload() { token }: { token: string }) {
    return await this.authService.refresh(token)
  }

  @MessagePattern({ cmd: "get_me_cmd" })
  public async getMe(@Payload() { userId }: { userId: number }) {
    return await this.authService.getMe(userId)
  }
}
