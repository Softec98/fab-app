import { Directive, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as textMask from 'node_modules/vanilla-text-mask/dist/vanillaTextMask.js';

@Directive({
  selector: '[appMaskCep]'
})
export class MaskCepDirective {

  private defaultLang: string = environment.defaultLang.substring(0, 2);

  mask = this.defaultLang == 'en' ?
    [/\d/, /\d/, /\d/, /\d/, /\d/] :
    [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]

  maskedInputController: any;

  constructor(private element: ElementRef) {
    this.maskedInputController = textMask.maskInput({
      inputElement: this.element.nativeElement,
      mask: this.mask
    });
  }

  ngOnInit() {
    this.formatValue((this.element.nativeElement as HTMLInputElement).value);
  }

  formatValue(event: string) {

    event = event.replace(/-/i, '').replace('_', '');

    if (event.length == 8) {

      let newVal = `${event.substring(0, 5)}-${event.substring(5)}`;

      (this.element.nativeElement as HTMLInputElement).value = newVal;
    }
  }

  ngOnDestroy() {
    this.maskedInputController.destroy();
  }
}