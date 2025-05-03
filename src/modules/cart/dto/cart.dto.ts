import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsObjectId } from 'src/common/decorators/object-id.decarator';

export class AddToCartDto {
  @ApiProperty()
  @IsObjectId()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  quantity: number;
}

export class UpdateCartDto {
  @ApiProperty()
  @IsObjectId()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsNumber()
  @Max(1000)
  @Min(1)
  quantity: number;
}

export class DeleteCartDto {
  @ApiProperty()
  @IsObjectId()
  @IsString()
  _id: string;
}
