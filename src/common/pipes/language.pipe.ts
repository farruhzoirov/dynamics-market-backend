import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AcceptLanguagePipe implements PipeTransform {
  readonly allowedLanguages = ['uz', 'ru', 'en'];
  transform(value: any) {
    if (!value) return 'Uz';
    if (value && !this.allowedLanguages.includes(value)) {
      return null;
    }
    const normalizedValue =
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return normalizedValue;
  }
}
