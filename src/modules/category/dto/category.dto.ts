import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  UniversalQueryDto,
  UpdateBaseModelDto,
  DeleteBaseModelDto,
  BaseModelDto,
} from 'src/shared/dto/base-model.dto';

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

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];
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
