import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsOptional,
} from 'class-validator';

export default class OperationDto {
  @IsString()
  @IsNotEmpty()
  quoteTo: string;

  @IsString()
  @IsNotEmpty()
  currentCoin: string;

  @IsUUID()
  @IsOptional()
  receiverAddress: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;
}
