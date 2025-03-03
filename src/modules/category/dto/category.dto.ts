import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  UniversalQueryDto,
  UpdateBaseModelDto,
  DeleteBaseModelDto,
} from 'src/shared/dto/base-model.dto';

// dto for query
export class GetCategoryDto extends UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;
}

export class AddCategoryDto {
  @ApiProperty({ example: 'Asosiy toifa nomi (uz)' })
  @IsString()
  @IsNotEmpty()
  nameUz: string;

  @ApiProperty({ example: 'Основная категория (ru)' })
  @IsString()
  @IsNotEmpty()
  nameRu: string;

  @ApiProperty({ example: 'Main category (en)' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];

  @IsString()
  @IsOptional()
  slugUz?: string;

  @IsString()
  @IsOptional()
  slugRu?: string;

  @IsString()
  @IsOptional()
  slugEn?: string;
}

export class UpdateCategoryDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];
}

export class DeleteCategoryDto extends DeleteBaseModelDto {}
