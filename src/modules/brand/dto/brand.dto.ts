import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import {
  UniversalQueryDto,
  BaseModelDto,
  UpdateBaseModelDto,
  DeleteBaseModelDto,
} from '../../../shared/dto/base-model.dto';

export class GetBrandListsDto extends UniversalQueryDto {}

export class AddBrandDto extends BaseModelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  @IsString()
  website: string;
}

export class UpdateBrandDto extends UpdateBaseModelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  logo: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  @IsString()
  website: string;
}

export class DeleteBrandDto extends DeleteBaseModelDto {}
