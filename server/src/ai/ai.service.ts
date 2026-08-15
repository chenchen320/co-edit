import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: 'sk-41d502ecf6e44832a383fda7c984df95',
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generator(prompt: string) {
    const systemPrompt = `
      你是一个专业的高级文档助理。
      请根据用户的要求，撰写一篇排版优雅的文章。
      你必须且只能返回 HTML 格式的富文本，使用 <p>, <h1>, <h2>, <ul>, <li>, <strong> 等标准标签。
      不要返回 Markdown 语法，不要用 \`\`\`html 包裹。
      请拟定一个适合的标题，并以标准 JSON 格式返回，格式如下：
      { "title": "拟定的标题", "content": "HTML正文" }
    `;

    const response = await this.openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const jsonText = response.choices[0].message.content;
    if (!jsonText) {
      throw new Error('AI 生成内容为空');
    }

    return JSON.parse(jsonText);
  }
}
