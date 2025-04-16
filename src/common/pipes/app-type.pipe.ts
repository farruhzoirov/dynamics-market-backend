import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AcceptAppTypePipe implements PipeTransform {
  private readonly allowedAppTypes = ['admin', 'user'];

  transform(value: any) {
    if (!value) {
      throw new BadRequestException('App type is required');
    }
    if (value && !this.allowedAppTypes.includes(value)) {
      throw new BadRequestException('App type is not valid');
    }
    return value;
  }
}
