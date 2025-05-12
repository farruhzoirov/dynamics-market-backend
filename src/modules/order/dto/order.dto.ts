import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsEmail,
} from 'class-validator';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { OrderStatus } from '../../../shared/enums/order-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsObjectId } from 'src/common/decorators/object-id.decarator';
import {
  DeleteBaseModelDto,
  UniversalQueryDto,
} from 'src/shared/dto/base-model.dto';

export class GetAllOrdersDto extends UniversalQueryDto {}

export class GetOrderDto {
  @ApiProperty()
  @IsObjectId()
  @IsString()
  @IsOptional()
  _id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  orderCode: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Farruh' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Zoirov' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'fzoirov29@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: CustomerType, example: CustomerType.INDIVIDUAL })
  @IsEnum(CustomerType)
  customerType: CustomerType;

  @ApiProperty({ example: 'Dynamics market', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: '+998975450409' })
  @IsString()
  @IsPhoneNumber()
  phone: string;
}

export class UpdateOrderDto {
  @IsObjectId()
  @IsString()
  _id: string;

  @ApiProperty({ example: 'Farruh' })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ example: 'Zoirov' })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ example: 'fzoirov29@gmail.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ enum: CustomerType, example: CustomerType.INDIVIDUAL })
  @IsEnum(CustomerType)
  @IsOptional()
  customerType: CustomerType;

  @ApiProperty({ example: 'Dynamics market', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: '+998975450409' })
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.new })
  @IsEnum(OrderStatus)
  @IsOptional()
  status: OrderStatus;
}

export class DeleteOrderDto extends DeleteBaseModelDto {}
