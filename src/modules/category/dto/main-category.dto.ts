import {ApiProperty} from "@nestjs/swagger";
import {IS_ARRAY, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";


// This dto for query parameters
export class GetMainCategoryDto {
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


export class CreateMainCategoryDto {
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


export class UpdateMainCategoryDto {
  @ApiProperty()
  @IsString()
  _id: string;

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


export class DeleteMainCategoryDto {
  @ApiProperty({required: true})
  @IsString()
  @IsNotEmpty()
  _id: string;
}
