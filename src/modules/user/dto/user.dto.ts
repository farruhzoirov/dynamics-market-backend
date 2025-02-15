import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsEmail, IsNumber, IsOptional, IsString, Validate, ValidateNested} from "class-validator";
import {ILocation} from "../interfaces/location";
import {Gender} from "../enums/gender.enum";
import {Type} from "class-transformer";

export class UpdateUserDto {
  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({required: false})
  @IsOptional()
  @IsEmail()
  email: String

  @ApiProperty({
    required: false,
    type: 'array',
    items: {type: 'object', properties: {lang: {type: 'number'}, lat: {type: 'number'}}},
    description: 'Array of location objects with lang and lat',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  location: ILocation[]

  @ApiProperty({
    required: false,
    description: "it will be user's telegram username"
  })
  @IsString()
  telegram: String

  @ApiProperty({
    required: false,
    enum: Gender,
    description: "User gender (male or female)"
  })
  @IsString()
  gender: Gender

  @ApiProperty({
    required: false,
  })
  @IsString()
  regionId: String

  @ApiProperty({
    required: false,
  })
  @IsString()
  districtId: String

  @ApiProperty({
    required: false,
  })
  @IsString()
  address: String

  @ApiProperty({
    required: false,
  })
  @IsString()
  phone: String
}

export class LocationDto {
  @IsNumber()
  lang: number;

  @IsNumber()
  lat: number;
}
