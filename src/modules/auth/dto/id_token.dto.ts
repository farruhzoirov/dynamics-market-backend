import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, MinLength} from "class-validator";

export class VerifyTokenDto {
  @ApiProperty({required: true})
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  id_token: string;
}


