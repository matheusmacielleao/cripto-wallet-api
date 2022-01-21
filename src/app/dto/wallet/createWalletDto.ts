import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsDate,
  isNotEmpty,
  IsDateString,
} from 'class-validator';

export default class CreateWallettDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsDateString()
  @IsNotEmpty()
  birthdate: Date;
}
