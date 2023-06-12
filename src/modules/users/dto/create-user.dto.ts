import { Length, Matches } from 'class-validator';

export class CreateUserDto {
  @Length(3, 10)
  login: string;
  @Length(6, 20)
  password: string;
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
