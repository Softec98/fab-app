import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClienteDB } from 'src/app/Core/Entities/ClienteDB';
import { DataService } from 'src/app/Infrastructure/Services/data.service';

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
  qtdLinPgN: number = 48;
  paginas: number = 0;

  constructor(
    protected dataService: DataService,
    public dialogRef: MatDialogRef<GuiaExpedicaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  async ngOnInit(): Promise<void> {
    this.paginas = Math.ceil((this.data.Dados.PedidosItensDto.length - this.qtdLinPg1) / this.qtdLinPgN);
    let cliente = await this.dataService.obterClientePorId(this.data.Dados.Id_Cliente);
    if (cliente != null) {
      this.cidade = cliente.xMun;
      this.uf = cliente.UF;
      this.documento = cliente.CNPJ;
      if (this.data.Dados.obs) {
        this.obs = this.data.Dados.obs.toString().split('\n').join("<br />");
      }
    }
  }
}