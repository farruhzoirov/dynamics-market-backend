import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, MinLength} from "class-validator";

export class IdTokenDto {
  @ApiProperty({required: true})
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  idToken: string;
}


