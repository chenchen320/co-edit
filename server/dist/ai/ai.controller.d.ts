import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generate(body: {
        prompt: string;
    }): Promise<any>;
}
