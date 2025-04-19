import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsObjectId } from 'src/common/decorators/object-id.decarator';

export class AddReviewDto {
  @ApiProperty()
  @IsObjectId({ message: 'Invalid productId' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  text: string;
}

export class UpdateReviewDto {
  @ApiProperty()
  @IsObjectId({ message: 'Invalid _id' })
  @IsString()
  @IsNotEmpty()
  _id: string;

  @ApiProperty()
  @IsObjectId({ message: 'Invalid productId' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  text: string;
}

export class DeleteReviewDto {
  @ApiProperty()
  @IsObjectId({ message: 'Invalid _id' })
  @IsString()
  @IsNotEmpty()
  _id: string;
}
