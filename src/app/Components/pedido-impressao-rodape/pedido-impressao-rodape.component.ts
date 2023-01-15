import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pedido-impressao-rodape',
  templateUrl: './pedido-impressao-rodape.component.html',
  styleUrls: ['./pedido-impressao-rodape.component.scss']
})
export class PedidoImpressaoRodapeComponent {
  @Input() valTotal: number = 0;
}