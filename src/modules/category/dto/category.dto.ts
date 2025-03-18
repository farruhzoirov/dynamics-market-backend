import {ApiProperty} from '@nestjs/swagger';
import {IsArray, IsNumber, IsOptional, IsString, ValidateNested,} from 'class-validator';
import {Type} from 'class-transformer';
import {BaseModelDto, DeleteBaseModelDto, UniversalQueryDto, UpdateBaseModelDto,} from 'src/shared/dto/base-model.dto';

import {FileMetadataDto} from 'src/shared/dto/file-meta.dto';

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

  @ApiProperty({type: [FileMetadataDto]})
  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];

  hierarchy: string[];
}

export class UpdateCategoryDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;

  @IsOptional()
  @IsNumber()
  status: number;

  @ApiProperty({type: [FileMetadataDto]})
  @IsOptional()
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];
}

export class DeleteCategoryDto extends DeleteBaseModelDto {
}
