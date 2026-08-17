import { Observable } from 'rxjs';
export declare class AiService {
    private openai;
    constructor();
    generatorStream(prompt: string): Observable<MessageEvent>;
}
