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
  telvendedor!: string;
  condpagto: string = '';
  vendedor: string = '';
  obs!: string;
  qtdLinPg1: number = 24;
  qtdLinPgN: number = 48;
  paginas: number = 0;

  constructor(public dialogRef: MatDialogRef<PedidoImpressaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  async ngOnInit(): Promise<void> {
    this.paginas = Math.ceil((this.data.Dados.PedidosItensDto.length - this.qtdLinPg1) / this.qtdLinPgN);
    let cliente = await db.Clientes.get(this.data.Dados.Id_Cliente);
    if (cliente != null) {
      this.endereco = 'Endereço: ' + cliente.xLgr + ' ' +
        (cliente.xComplemento == null ? '' : cliente.xComplemento).trim() +
        ', ' + cliente.nro.toString() + ' - ' + cliente.cBairro;
      this.cidade = cliente.xMun + ' - ' + cliente.UF + ', ';
      this.cep = cliente.CEP;
      this.telefone = cliente.fone == '' ? cliente.fone2 : cliente.fone;
      if (this.data.Dados.obs) {
        this.obs = this.data.Dados.obs.toString().split('\n').join("<br />");
      }
      let cp = await db.CondPagto.get(this.data.Dados.Id_Cond_Pagto);
      if (cp) {
        let fv = await db.FaixaValores.get(cp?.Id_FaixaValor!);
        this.condpagto = cp?.xNome + ' ( até R$ ' + fv?.Valor.toString() + ' )';
      }
      let vendedor = await db.Vendedores.get(this.data.Dados.Id_Vendedor);
      if (vendedor) {
        this.vendedor = vendedor.xNome.trim() + ' (' + vendedor.xContato.split(',')[0].trim() + ')'
        this.telvendedor = vendedor.fone;
      }
    }
  }
}