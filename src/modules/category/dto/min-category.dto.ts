import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {UniversalQueryDto} from "../../../shared/dto/universal-query.dto";

// This dto for query parameters
export class GetMidCategoryDto extends UniversalQueryDto {}

export class CreateMidCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @ApiProperty({example: "Asosiy toifa nomi (uz)", description: "Main category name in Uzbek"})
  @IsString()
  @IsNotEmpty()
  nameUz: string;

  @ApiProperty({example: "Основная категория (ru)", description: "Main category name in Russian"})
  @IsString()
  @IsNotEmpty()
  nameRu: string;

  @ApiProperty({example: "Main category (en)", description: "Main category name in English"})
  @IsString()
  @IsNotEmpty()
  nameEn: string;


  @IsString()
  @IsOptional()
  slugUz?: string;

  @IsString()
  @IsOptional()
  slugRu?: string;

  @IsString()
  @IsOptional()
  slugEn?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];
}


export class UpdateMidCategoryDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;

  @ApiProperty({example: "Asosiy toifa nomi (uz)", description: "Main category name in Uzbek"})
  @IsString()
  nameUz: string;

  @ApiProperty({example: "Основная категория (ru)", description: "Main category name in Russian"})
  @IsString()
  nameRu: string;

  @ApiProperty({example: "Main category (en)", description: "Main category name in English"})
  @IsString()
  nameEn: string;

  @IsString()
  @IsOptional()
  slugUz?: string;

  @IsString()
  @IsOptional()
  slugRu?: string;

  @IsString()
  @IsOptional()
  slugEn?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];
}


export class DeleteMidCategoryDto {
  @ApiProperty({required: true})
  @IsString()
  @IsNotEmpty()
  _id: string;
}

