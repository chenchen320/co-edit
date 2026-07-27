import { IsNotEmpty, IsString, IsOptional } from "class-validator";
export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
  
  @IsOptional()
  @IsString()
  content?: string;
}
