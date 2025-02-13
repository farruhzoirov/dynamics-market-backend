import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";


export class GetMainCategoryDto {
  @IsOptional()
  @IsNumber()
  page?: number;


  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  select?: string;

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

}


export class UpdateMainCategoryDto {
  @ApiProperty({example: "Asosiy toifa nomi (uz)", description: "Main category name in Uzbek"})
  @IsString()
  nameUz: string;

  @ApiProperty({example: "Основная категория (ru)", description: "Main category name in Russian"})
  @IsString()
  nameRu: string;

  @ApiProperty({example: "Main category (en)", description: "Main category name in English"})
  @IsString()
  nameEn: string;

  @ApiProperty({example: "asosiy-toifa", description: "Slug for category in Uzbek"})
  @IsString()
  slugUz: string;

  @ApiProperty({example: "osnovnaya-kategoriya", description: "Slug for category in Russian"})
  @IsString()
  slugRu: string;

  @ApiProperty({example: "main-category", description: "Slug for category in English"})
  @IsString()
  @IsNotEmpty()
  slugEn: string;
}


export class DeleteMainCategoryDto {
  @ApiProperty({required: true})
  @IsString()
  @IsNotEmpty()
  id: string;
}