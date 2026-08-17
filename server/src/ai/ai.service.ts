import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Observable } from 'rxjs';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: 'sk-lohipgcabsawoljrpzrhwhragkhouihystfhajmkgzvqupcn',
      baseURL: 'https://api.siliconflow.cn/v1',
    });
  }

  generatorStream(prompt: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observe) => {
      void (async () => {
        try {
          const systemPrompt = `
            你是一个专业的高级文档助理。
            请根据用户的要求，撰写一篇排版优雅的文章。
            你必须且只能返回 HTML 格式的富文本，使用 <p>, <h1>, <h2>, <ul>, <li>, <strong> 等标准标签。
            不要返回 Markdown 语法，不要用 \`\`\`html 包裹。
            直接返回 HTML 富文本正文。
          `;

          const responseStream = await this.openai.chat.completions.create({
            model: 'deepseek-ai/DeepSeek-V3',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            stream: true,
          });

          for await (const chunk of responseStream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              observe.next({ data: text } as MessageEvent);
            }
          }

          observe.complete();
        } catch (err) {
          observe.error(err);
        }
      })();
    });
  }
}
