import { Observable } from 'rxjs';
import { AiService } from './ai.service';
import { Controller, Sse, Query } from '@nestjs/common';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Sse('generate-stream')
  generateStream(@Query('prompt') prompt: string): Observable<MessageEvent> {
    return this.aiService.generatorStream(prompt);
  }
}
