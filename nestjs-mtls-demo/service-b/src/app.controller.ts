import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  ping() {
    return { message: 'pong from service-b' };
  }
}
