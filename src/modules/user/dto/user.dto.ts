import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Validate, ValidateNested} from "class-validator";
import {ILocations} from "../interfaces/location";
import {Gender} from "../enums/gender.enum";
import {Type} from "class-transformer";

export class UpdateUserDto {
  @ApiProperty({required: true})
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({required: true})
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({required: false})
  @IsEmail()
  @IsNotEmpty()
  email: String

  @ApiProperty({
    required: false,
    type: 'array',
    items: {type: 'object', properties: {long: {type: 'number'}, lat: {type: 'number'}}},
    description: 'Array of location objects with long and lat',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationsDto)
  locations: ILocations[]

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
  @IsNotEmpty()
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

export class LocationsDto {
  @IsNumber()
  long: number;

  @IsNumber()
  lat: number;
}
