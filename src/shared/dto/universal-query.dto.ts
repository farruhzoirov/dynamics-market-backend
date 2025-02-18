import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString} from "class-validator";

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