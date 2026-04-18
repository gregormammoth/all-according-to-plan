import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get('health')
  health() {
    return { status: 'placeholder' };
  }
}
