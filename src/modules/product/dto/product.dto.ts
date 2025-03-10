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

import { FileMetadataDto } from 'src/shared/dto/file-meta.dto';

// ------ Attribute based
// class AttributeValueDto {
//   @ApiProperty()
//   @IsString()
//   valueUz: string;

//   @ApiProperty()
//   @IsString()
//   valueRu: string;

//   @ApiProperty()
//   @IsString()
//   valueEn: string;
// }

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
  @IsString()
  descriptionUz: string;

  @ApiProperty()
  @IsString()
  descriptionRu: string;

  @ApiProperty()
  @IsString()
  descriptionEn: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  oldPrice: number;

  @ApiProperty()
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

  @ApiProperty({ type: [FileMetadataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];

  @ApiProperty()
  @IsOptional()
  details: any;

  sku?: string;
}

export class UpdateProductDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsString()
  descriptionUz: string;

  @ApiProperty()
  @IsString()
  descriptionRu: string;

  @ApiProperty()
  @IsString()
  descriptionEn: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  oldPrice: number;

  @ApiProperty()
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

  @ApiProperty()
  @IsOptional()
  details: any;

  @ApiProperty({ type: [AttributeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  attributes: AttributeDto[];

  @ApiProperty({ type: [FileMetadataDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];
}

export class DeleteProductDto extends DeleteBaseModelDto {}
