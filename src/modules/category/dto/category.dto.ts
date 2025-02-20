import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {UniversalQueryDto} from "../../../shared/dto/universal-query.dto";
import {ValidateObjectIdPipe} from "../../../common/pipes/object-id.pipe";


// dto for query
export class GetCategoryDto extends UniversalQueryDto {}


export class AddCategoryDto {
  @ApiProperty({example: "Asosiy toifa nomi (uz)"})
  @IsString()
  @IsNotEmpty()
  nameUz: string;

  @ApiProperty({example: "Основная категория (ru)"})
  @IsString()
  @IsNotEmpty()
  nameRu: string;

  @ApiProperty({example: "Main category (en)"})
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  parentId: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];

  @IsString()
  @IsOptional()
  slugUz?: string;

  @IsString()
  @IsOptional()
  slugRu?: string;

  @IsString()
  @IsOptional()
  slugEn?: string;
}

export class UpdateCategoryDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty({example: "Asosiy toifa nomi (uz)"})
  @IsString()
  nameUz: string;

  @ApiProperty({example: "Основная категория (ru)"})
  @IsString()
  nameRu: string;

  @ApiProperty({example: "Main category (en)"})
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
  @IsString()
  parentId: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  images: string[];
}


export class DeleteCategoryDto {
  @ApiProperty({required: true})
  @IsString()
  @IsNotEmpty()
  _id: string;
}
