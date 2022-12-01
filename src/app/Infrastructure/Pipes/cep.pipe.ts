import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cep'
})
export class CepPipe implements PipeTransform {
  transform(value: string | number): string {
    let valorFormatado = value + '';
    valorFormatado = valorFormatado
      .trim()
      .replace(
        /(\d{5})(\d{3})/,
        '$1-$2'
      );
    return valorFormatado;
  }
}