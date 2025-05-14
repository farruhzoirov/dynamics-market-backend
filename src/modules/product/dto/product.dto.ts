import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IsObjectId } from 'src/common/decorators/object-id.decarator';
import { FileMetadataDto } from 'src/shared/dto/file-meta.dto';

import {
  BaseModelDto,
  DeleteBaseModelDto,
  UniversalQueryDto,
  UpdateBaseModelDto,
} from 'src/shared/dto/base-model.dto';
import { InStockStatus } from 'src/shared/enums/stock-status.enum';

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

export class SearchProductsDto extends UniversalQueryDto {}

export class GetProductsListForFrontDto extends UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  category: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  brands: string[];

  @ApiProperty({ example: '0-10000' })
  @IsOptional()
  @IsString()
  price: string;
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
  @ValidateIf(
    (o) =>
      o.oldPrice !== null && o.oldPrice !== undefined && o.currentPrice !== '',
  )
  @IsNumber()
  @IsOptional()
  oldPrice: number;

  @ApiProperty()
  @ValidateIf(
    (c) =>
      c.oldPrice !== null && c.oldPrice !== undefined && c.currentPrice !== '',
  )
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

  @ApiProperty({ enum: InStockStatus })
  @IsOptional()
  @IsEnum(InStockStatus)
  availability: InStockStatus;

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
  @ValidateIf(
    (o) =>
      o.oldPrice !== null && o.oldPrice !== undefined && o.currentPrice !== '',
  )
  @IsNumber()
  @IsOptional()
  oldPrice: number;

  @ApiProperty()
  @ValidateIf(
    (c) =>
      c.oldPrice !== null && c.oldPrice !== undefined && c.currentPrice !== '',
  )
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

  @ApiProperty({ enum: InStockStatus })
  @IsOptional()
  @IsEnum(InStockStatus)
  availability: InStockStatus;

  @ApiProperty()
  @IsOptional()
  details: any;
}

export class DeleteProductDto extends DeleteBaseModelDto {}
