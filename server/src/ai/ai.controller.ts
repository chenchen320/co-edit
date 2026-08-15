import { AiService } from './ai.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('generate')
  async generate(@Body() body: { prompt: string }) {
    return this.aiService.generator(body.prompt);
  }
}
