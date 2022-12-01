import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cnpj'
})
export class CnpjPipe implements PipeTransform {
  transform(value: string | number,
    ocultarAlgunsValores: boolean = false): string {
    let valorFormatado = value + '';
    valorFormatado = valorFormatado
      .padStart(14, '0')
      .substring(0, 14)
      .replace(/[^0-9]/, '')
      .replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    if (ocultarAlgunsValores) {
      valorFormatado = 'XX.' + valorFormatado.substring(3, 11) + '-XX';
    }
    return valorFormatado;
  }
}