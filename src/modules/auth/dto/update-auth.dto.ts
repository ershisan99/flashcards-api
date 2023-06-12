import { PartialType } from '@nestjs/mapped-types';
import { RegistrationDto } from './registration.dto';

export class UpdateAuthDto extends PartialType(RegistrationDto) {}
