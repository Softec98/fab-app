import { db } from '../../Infrastructure/ApplicationDB';
import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pedido-impressao',
  templateUrl: './pedido-impressao.component.html',
  styleUrls: ['./pedido-impressao.component.scss']
})
export class PedidoImpressaoComponent {
  @ViewChild('frente')
  frente!: ElementRef;
  endereco!: string;
  cidade!: string;
  cep!: string;
  telefone!: string;
  obs!: string;

  constructor(public dialogRef: MatDialogRef<PedidoImpressaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  async ngOnInit(): Promise<void> {
    let cliente = await db.Clientes.get(this.data.Id_Cliente);
    if (cliente != null) {
      this.endereco = 'Endereço: ' + cliente.xLgr + ' ' +
        (cliente.xComplemento == null ? '' : cliente.xComplemento).trim() +
        ', ' + cliente.nro.toString() + ' - ' + cliente.cBairro;
      this.cidade = cliente.xMun + ' - ' + cliente.UF + ', ';
      this.cep = cliente.CEP;
      this.telefone = cliente.fone;
      if (this.data.obs) {
        this.obs = this.data.obs.toString().split('\n').join("<br />");
      }
    }
  }
}