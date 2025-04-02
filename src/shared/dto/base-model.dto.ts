import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { IsObjectId } from 'src/common/decorator/object-id.decarator';

export class UniversalQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  select?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;
}

export class BaseModelDto {
  @ApiProperty({ example: 'Nomi UZ' })
  @IsString()
  nameUz: string;

  @ApiProperty({ example: 'Nomi RU' })
  @IsString()
  nameRu: string;

  @ApiProperty({ example: 'Nomi EN' })
  @IsString()
  nameEn: string;
}

export class UpdateBaseModelDto {
  @ApiProperty()
  @IsObjectId()
  @IsString()
  _id: string;

  @ApiProperty({ example: 'Nomi UZ' })
  @IsOptional()
  @IsString()
  nameUz: string;

  @ApiProperty({ example: 'Nomi RU' })
  @IsOptional()
  @IsString()
  nameRu: string;

  @ApiProperty({ example: 'Nomi EN' })
  @IsOptional()
  @IsString()
  nameEn: string;
}

export class DeleteBaseModelDto {
  @ApiProperty({ required: true })
  @IsObjectId()
  @IsString()
  _id: string;
}
