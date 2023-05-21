import { IsEmail, IsString, Length, Max, Min } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @Length(2, 40)
  name: string;
}
