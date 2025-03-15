import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

import {
  UniversalQueryDto,
  BaseModelDto,
  UpdateBaseModelDto,
  DeleteBaseModelDto,
} from 'src/shared/dto/base-model.dto';

import { FileMetadataDto } from 'src/shared/dto/file-meta.dto';

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

export class GetProductsListDto extends UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  brandId: string;
}

export class GetProductBySlugDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  slug: string;
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

  @ApiProperty({ description: 'Array of keywords' })
  @Optional()
  @IsString()
  keywords: string;

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

  @ApiProperty({ description: 'Array of keywords' })
  @Optional()
  @IsString()
  keywords: string;

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

  @ApiProperty()
  @IsOptional()
  details: any;
}

export class DeleteProductDto extends DeleteBaseModelDto {}
