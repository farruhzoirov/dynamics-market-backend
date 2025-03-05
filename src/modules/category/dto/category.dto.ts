import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  UniversalQueryDto,
  UpdateBaseModelDto,
  DeleteBaseModelDto,
  BaseModelDto,
} from 'src/shared/dto/base-model.dto';

import { FileMetadataDto } from 'src/shared/dto/file-meta.dto';

// dto for query
export class GetCategoryDto extends UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;
}

export class AddCategoryDto extends BaseModelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;

  @ApiProperty({ type: [FileMetadataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];
}

export class UpdateCategoryDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;

  @ApiProperty({ type: [FileMetadataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];
}

export class DeleteCategoryDto extends DeleteBaseModelDto {}
