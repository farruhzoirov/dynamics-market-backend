import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { IsObjectId } from 'src/common/decorators/object-id.decarator';
import {
  DeleteBaseModelDto,
  UniversalQueryDto,
} from 'src/shared/dto/base-model.dto';

export class GetNewsListDto extends UniversalQueryDto {}

export class AddNewsDto {
  @ApiProperty()
  @IsString()
  titleUz: string;

  @ApiProperty()
  @IsString()
  titleRu: string;

  @ApiProperty()
  @IsString()
  titleEn: string;

  @ApiProperty()
  @IsString()
  shortDescUz: string;

  @ApiProperty()
  @IsString()
  shortDescRu: string;

  @ApiProperty()
  @IsString()
  shortDescEn: string;

  @ApiProperty()
  @IsString()
  contentUz: string;

  @ApiProperty()
  @IsString()
  contentRu: string;

  @ApiProperty()
  @IsString()
  contentEn: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;
}

export class UpdateNewsDto {
  @ApiProperty()
  @IsObjectId()
  _id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  titleUz?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  titleRu?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shortDescUz?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shortDescRu?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shortDescEn?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contentUz?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contentRu?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class GetOneNewsDto {
  @ApiProperty()
  @IsObjectId()
  @IsOptional()
  _id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug: string;
}

export class DeleteNewsDto extends DeleteBaseModelDto {}
