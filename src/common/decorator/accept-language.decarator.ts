import {BadRequestException, Injectable, PipeTransform} from '@nestjs/common';

@Injectable()
export class AcceptLanguagePipe implements PipeTransform {
  readonly allowedLanguages = ['uz', 'ru', 'en'];

  transform(value: any) {
    console.log(value)
    if (!value) return 'Uz';
    if (!this.allowedLanguages.includes(value)) {
      throw new BadRequestException(
          `Invalid language. Allowed values: ${this.allowedLanguages.join(', ')}`,
      );
    }
    const normalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return normalizedValue;
  }
}
