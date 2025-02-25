import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FilePathDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filePath: string;
}
