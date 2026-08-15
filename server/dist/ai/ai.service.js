"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
let AiService = class AiService {
    openai;
    constructor() {
        this.openai = new openai_1.default({
            apiKey: 'sk-41d502ecf6e44832a383fda7c984df95',
            baseURL: 'https://api.deepseek.com',
        });
    }
    async generator(prompt) {
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
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map