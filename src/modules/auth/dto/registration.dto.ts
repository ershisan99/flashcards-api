import { IsEmail, Length } from 'class-validator';

export class RegistrationDto {
  @Length(3, 30)
  name: string;
  @Length(3, 30)
  password: string;
  @IsEmail()
  email: string;
}
