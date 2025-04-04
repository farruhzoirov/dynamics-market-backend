import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsObjectId } from 'src/common/decorator/object-id.decarator';

import {
  BaseModelDto,
  DeleteBaseModelDto,
  UniversalQueryDto,
  UpdateBaseModelDto,
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

export class GetProductsListForFrontDto extends UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  categorySlug: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  brandsSlug: string[];

  @ApiProperty({ example: '0-10000' })
  @IsOptional()
  @IsString()
  priceRange: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  lastViewed: boolean;
}

export class GetProductsListDto extends UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsOptional()
  @IsObjectId()
  @IsString()
  brandId: string;
}

export class GetProductDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsOptional()
  @IsObjectId()
  @IsString()
  _id: string;
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
  @IsObjectId()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsObjectId()
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
}

export class UpdateProductDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  descriptionUz: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  descriptionRu: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  descriptionEn: string;

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
  @IsOptional()
  @IsObjectId()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsOptional()
  @IsObjectId()
  @IsString()
  brandId: string;

  @ApiProperty({ description: 'Array of keywords' })
  @IsOptional()
  @IsString()
  keywords: string;

  @ApiProperty({ type: [AttributeDto] })
  @IsOptional()
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
  @IsNumber()
  status: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  inStock: boolean;

  @ApiProperty()
  @IsOptional()
  details: any;
}

export class DeleteProductDto extends DeleteBaseModelDto {}
