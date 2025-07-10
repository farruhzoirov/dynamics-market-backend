import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  BaseModelDto,
  DeleteBaseModelDto,
  UpdateBaseModelDto,
} from '../../../shared/dto/base-model.dto';
import { IsObjectId } from '../../../common/decorators/object-id.decarator';
import { Type } from 'class-transformer';

export class OrderStatusItemDto {
  @ApiProperty({ example: '651bcb29d32e9e7d9f95f3dd' })
  @IsObjectId()
  _id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  index: number;
}

export class AddOrderStatusDto extends BaseModelDto {
  @ApiProperty()
  @IsString()
  color: string;
}

export class UpdateOrderStatusDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  color: string;
}

export class UpdateOrderStatusIndexDto {
  @ApiProperty({
    type: OrderStatusItemDto,
    isArray: true,
    description: 'Array of OrderStatus items with _id and index for sorting',
    example: [
      { _id: '651bcb29d32e9e7d9f95f3dd', index: 0 },
      { _id: '651bcb29d32e9e7d9f95f3de', index: 1 },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderStatusItemDto)
  indexes: OrderStatusItemDto[];
}

export class DeleteOrderStatusDto extends DeleteBaseModelDto {}
