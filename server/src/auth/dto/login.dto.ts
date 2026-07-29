import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class Logindto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
