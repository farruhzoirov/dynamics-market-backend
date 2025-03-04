import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import {
  UniversalQueryDto,
  BaseModelDto,
  UpdateBaseModelDto,
  DeleteBaseModelDto,
} from 'src/shared/dto/base-model.dto';

// ------ Attribute based
class AttributeValueDto {
  @ApiProperty()
  @IsString()
  valueUz: string;

  @ApiProperty()
  @IsString()
  valueRu: string;

  @ApiProperty()
  @IsString()
  valueEn: string;
}

class AttributeDto {
  @ApiProperty()
  @IsString()
  nameUz: string;

  @ApiProperty()
  @IsString()
  nameRu: string;

  @ApiProperty()
  @IsString()
  nameEn: string;

  @ApiProperty({ type: AttributeValueDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AttributeValueDto)
  value: AttributeValueDto;
}

// ------ Attribute based

export class GetProductDto extends UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  brandId: string;
}

export class AddProductDto extends BaseModelDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  oldPrice: number;

  @ApiProperty()
  @IsNumber()
  currentPrice: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  rate: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  brandId: string;

  @ApiProperty({ type: [AttributeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  attributes: AttributeDto[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];
}

export class UpdateProductDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  oldPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  currentPrice: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rate: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  brandId: string;

  @ApiProperty({ type: [AttributeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  attributes: AttributeDto[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];
}

export class DeleteProductDto extends DeleteBaseModelDto {}
