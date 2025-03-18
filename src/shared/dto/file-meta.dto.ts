import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';

export class FileMetadataDto {
  @ApiProperty()
  @IsString()
  fieldname: string;

  @ApiProperty()
  @IsString()
  originalname: string;

  @ApiProperty()
  @IsString()
  encoding: string;

  @ApiProperty()
  @IsString()
  mimetype: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiProperty()
  @IsString()
  filename: string;

  @ApiProperty()
  @IsString()
  path: string;

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty()
  @IsString()
  extension: string;
}
