import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsObjectId } from 'src/common/decorators/object-id.decarator';
import {
  DeleteBaseModelDto,
  UniversalQueryDto,
} from 'src/shared/dto/base-model.dto';

export class FaqOrderItemDto {
  @ApiProperty({ example: '651bcb29d32e9e7d9f95f3dd' })
  @IsObjectId()
  _id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  index: number;
}

export class GetFaqListDto extends UniversalQueryDto {}

export class AddFaqDto {
  @ApiProperty()
  @IsString()
  questionUz: string;

  @ApiProperty()
  @IsString()
  questionRu: string;

  @ApiProperty()
  @IsString()
  questionEn: string;

  @ApiProperty()
  @IsString()
  answerUz: string;

  @ApiProperty()
  @IsString()
  answerRu: string;

  @ApiProperty()
  @IsString()
  answerEn: string;
}

export class GetFaqDto {
  @ApiProperty()
  @IsObjectId()
  @IsString()
  _id: string;
}

export class UpdateFaqDto {
  @ApiProperty()
  @IsObjectId()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  questionUz: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  questionRu: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  questionEn: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  answerUz: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  answerRu: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  answerEn: string;

  @ApiProperty()
  @IsOptional()
  @Min(0)
  @Max(1)
  status: number;
}

export class UpdateFaqsOrderDto {
  @ApiProperty({
    type: FaqOrderItemDto,
    isArray: true,
    description: 'Array of FAQ items with _id and index for sorting',
    example: [
      { _id: '651bcb29d32e9e7d9f95f3dd', index: 0 },
      { _id: '651bcb29d32e9e7d9f95f3de', index: 1 },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FaqOrderItemDto)
  orders: FaqOrderItemDto[];
}

export class DeleteFaqDto extends DeleteBaseModelDto {}
