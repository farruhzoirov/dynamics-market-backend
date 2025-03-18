import {Prop} from '@nestjs/mongoose';

export class FileMetadata {
  @Prop({required: true})
  fieldname: string;

  @Prop({required: true})
  originalname: string;

  @Prop({required: true})
  encoding: string;

  @Prop({required: true})
  mimetype: string;

  @Prop({required: true})
  destination: string;

  @Prop({required: true})
  filename: string;

  @Prop({required: true})
  path: string;

  @Prop({required: true})
  size: number;

  @Prop({required: true})
  extension: string;
}
