import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zeroEsquerda'
})
export class ZeroEsquerdaPipe implements PipeTransform {
  transform(value: string | number,
    casas: number): string {
    let valorFormatado = (typeof value == 'undefined' ? '' : value) + '';
    valorFormatado = valorFormatado == '' ? '' :
      valorFormatado.padStart(casas, '0');
    return valorFormatado;
  }
}