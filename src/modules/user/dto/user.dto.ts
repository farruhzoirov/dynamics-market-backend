import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ILocations } from '../../../shared/interfaces/location';
import { Gender } from '../enums/gender.enum';

export class UpdateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  // @ApiProperty({required: false})
  // @IsEmail()
  // @IsNotEmpty()
  // email: String

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: { long: { type: 'number' }, lat: { type: 'number' } },
    },
    description: 'Array of location objects with long and lat',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationsDto)
  locations: ILocations[];

  @ApiProperty({
    required: false,
    description: "it will be user's telegram username",
  })
  @IsString()
  @IsOptional()
  telegram: string;

  @ApiProperty({
    required: false,
    enum: Gender,
    description: 'User gender (male or female)',
  })
  @IsString()
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  regionId: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  districtId: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  phone: string;
}

export class LocationsDto {
  @IsNumber()
  long: number;

  @IsNumber()
  lat: number;
}
