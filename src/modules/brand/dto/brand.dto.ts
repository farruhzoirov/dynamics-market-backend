import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsOptional, IsString, IsUrl} from "class-validator";
import {UniversalQueryDto} from "../../../shared/dto/universal-query.dto";

export class GetBrandListsDto extends UniversalQueryDto {
}

export class AddBrandDto {
  @ApiProperty({example: "Brand", description: "Brand name in Uzbek"})
  @IsString()
  nameUz: string;

  @ApiProperty({example: "Brand", description: "Brand name in Russian"})
  @IsString()
  nameRu: string;

  @ApiProperty({example: "Brand", description: "Brand name in English"})
  @IsString()
  nameEn: string;

  @IsString()
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
  logo: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  @IsString()
  website: string
}

export class UpdateBrandDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty({example: "Brand", description: "Brand name in Uzbek"})
  @IsString()
  @IsOptional()
  nameUz: string;

  @ApiProperty({example: "Brand", description: "Brand name in Russian"})
  @IsString()
  @IsOptional()
  nameRu: string;

  @ApiProperty({example: "Brand", description: "Brand name in English"})
  @IsString()
  @IsOptional()
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
  logo: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  @IsString()
  website: string
}


export class DeleteBrandDto {
  @ApiProperty({required: true})
  @IsString()
  @IsNotEmpty()
  _id: string;
}
