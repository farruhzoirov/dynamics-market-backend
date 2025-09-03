import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ContactDto {
  @ApiProperty({ example: 'Farruh' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'fzoirov29@gmail.com' })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ example: '@farruh_zoir' })
  @IsString()
  tgOrPhone: string;

  @ApiProperty({ example: 'Nimadur...' })
  @IsString()
  @IsOptional()
  message: string;
}
