import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { db } from 'src/app/Infrastructure/ApplicationDB';

@Component({
  selector: 'app-guia-expedicao',
  templateUrl: './guia-expedicao.component.html',
  styleUrls: ['./guia-expedicao.component.scss']
})

export class GuiaExpedicaoComponent {
  uf!: string;
  obs!: string;
  cidade!: string;
  documento!: string;
  qtdTracos: number = 73;
  qtdLinPg1: number = 24;
  qtdLinPgN: number = 49;

  constructor(public dialogRef: MatDialogRef<GuiaExpedicaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  async ngOnInit(): Promise<void> {
    let cliente = await db.Clientes.get(this.data.Id_Cliente);
    if (cliente != null) {
      this.cidade = cliente.xMun;
      this.uf = cliente.UF;
      this.documento = cliente.CNPJ;
      if (this.data.obs) {
        this.obs = this.data.obs.toString().split('\n').join("<br />");
      }
    }
  }
}