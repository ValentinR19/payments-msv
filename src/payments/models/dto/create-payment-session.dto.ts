import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreatePaymentSessionDTO {
  @IsNumber()
  idOrder: number;

  @MaxLength(3)
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => PaymentSessionItemDTO)
  items: PaymentSessionItemDTO[];
}

export class PaymentSessionItemDTO {
  @IsString()
  name: string;

  @IsPositive()
  @IsNumber()
  price: number;

  @IsPositive()
  @IsNumber()
  quantity: number;
}
