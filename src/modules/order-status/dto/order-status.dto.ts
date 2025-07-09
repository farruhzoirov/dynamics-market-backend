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
  DeleteBaseModelDto,
  UpdateBaseModelDto,
} from '../../../shared/dto/base-model.dto';
import { IsObjectId } from '../../../common/decorators/object-id.decarator';
import { Prop } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { FaqOrderItemDto } from '../../faq/dto/faq.dto';

export class OrderStatusItemDto {
  @ApiProperty({ example: '651bcb29d32e9e7d9f95f3dd' })
  @IsObjectId()
  _id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  index: number;
}

export class AddOrderStatusDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty()
  @IsObjectId()
  _id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;
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
