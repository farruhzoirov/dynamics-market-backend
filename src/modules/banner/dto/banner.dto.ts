import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BannerTypes } from '../schema/banner.schema';
import { ApiProperty } from '@nestjs/swagger';

import { FileMetadataDto } from 'src/shared/dto/file-meta.dto';
import {
  DeleteBaseModelDto,
  UniversalQueryDto,
} from 'src/shared/dto/base-model.dto';
import { IsObjectId } from 'src/common/decorators/object-id.decarator';

export class GetBannersListDto extends UniversalQueryDto {}

export class AddBannerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  titleUz: string;

  @ApiProperty({ description: 'Title in Russian', example: 'Banner Title Ru' })
  @IsNotEmpty()
  @IsString()
  titleRu: string;

  @ApiProperty({ description: 'Title in English', example: 'Banner Title En' })
  @IsNotEmpty()
  @IsString()
  titleEn: string;

  @ApiProperty({ description: 'Text in Uzbek', example: 'Banner Text Uz' })
  @IsString()
  textUz: string;

  @ApiProperty({ description: 'Text in Russian', example: 'Banner Text Ru' })
  @IsString()
  textRu: string;

  @ApiProperty({ description: 'Text in English', example: 'Banner Text En' })
  @IsString()
  textEn: string;

  @ApiProperty({ description: 'Image metadata', type: [FileMetadataDto] })
  @ValidateNested()
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'List of brand IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandIds: string[];

  @ApiProperty({ description: 'Type of the banner', enum: BannerTypes })
  @IsNotEmpty()
  @IsEnum(BannerTypes)
  type: BannerTypes;
}

export class UpdateBannerDto {
  @IsObjectId()
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Title in Uzbek',
    example: 'Updated Title Uz',
    required: false,
  })
  @IsOptional()
  @IsString()
  titleUz: string;

  @ApiProperty({
    description: 'Title in Russian',
    example: 'Updated Title Ru',
    required: false,
  })
  @IsOptional()
  @IsString()
  titleRu: string;

  @ApiProperty({
    description: 'Title in English',
    example: 'Updated Title En',
    required: false,
  })
  @IsOptional()
  @IsString()
  titleEn: string;

  @ApiProperty({
    description: 'Text in Uzbek',
    example: 'Updated Text Uz',
    required: false,
  })
  @IsOptional()
  @IsString()
  textUz: string;

  @ApiProperty({
    description: 'Text in Russian',
    example: 'Updated Text Ru',
    required: false,
  })
  @IsOptional()
  @IsString()
  textRu: string;

  @ApiProperty({
    description: 'Text in English',
    example: 'Updated Text En',
    required: false,
  })
  @IsOptional()
  @IsString()
  textEn: string;

  @ApiProperty({ description: 'Image metadata', type: [FileMetadataDto] })
  @ValidateNested()
  @Type(() => FileMetadataDto)
  images: FileMetadataDto[];

  @ApiProperty()
  @IsOptional()
  @IsObjectId()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsOptional()
  @IsObjectId()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsObjectId({ each: true })
  brandIds: string[];

  @ApiProperty({
    description: 'Type of the banner',
    enum: BannerTypes,
    required: false,
  })
  @IsOptional()
  @IsEnum(BannerTypes)
  type: BannerTypes;

  @ApiProperty({
    description: 'Status of the banner',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  status: number;
}

export class DeleteBannerDto extends DeleteBaseModelDto {}
