import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export default class OperationDto {
  @IsString()
  @IsNotEmpty()
  quoteTo: string;

  @IsString()
  @IsNotEmpty()
  currentCoin: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;
}
