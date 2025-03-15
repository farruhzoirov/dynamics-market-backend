import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  UniversalQueryDto,
  BaseModelDto,
  UpdateBaseModelDto,
  DeleteBaseModelDto,
} from '../../../shared/dto/base-model.dto';

import { FileMetadataDto } from '../../../shared/dto/file-meta.dto';

export class GetBrandListsDto extends UniversalQueryDto {}

export class AddBrandDto extends BaseModelDto {
  @ApiProperty({ type: FileMetadataDto })
  @IsObject()
  @Type(() => FileMetadataDto)
  logo: FileMetadataDto;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  @IsString()
  website: string;
}

export class UpdateBrandDto extends UpdateBaseModelDto {
  @ApiProperty({ type: FileMetadataDto })
  @IsOptional()
  @IsObject()
  @Type(() => FileMetadataDto)
  logo: FileMetadataDto;

  @IsOptional()
  @IsNumber()
  status: number;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  @IsString()
  website: string;
}

export class DeleteBrandDto extends DeleteBaseModelDto {}
