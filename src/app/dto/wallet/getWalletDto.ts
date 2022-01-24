import { Optional } from '@nestjs/common';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  isNotEmpty,
  IsDateString,
  IsUUID,
} from 'class-validator';

export default class GetWalletDto {
  @Optional()
  adress: string;
  @Optional()
  name: string;

  @Optional()
  cpf: string;

  @Optional()
  birthdate: Date;
}
