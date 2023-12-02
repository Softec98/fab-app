import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClienteDB } from 'src/app/Core/Entities/ClienteDB';
import { CondPagtoDB } from 'src/app/Core/Entities/CondPagtoDB';
import { FaixaValorDB } from 'src/app/Core/Entities/FaixaValorDB';
import { VendedorDB } from 'src/app/Core/Entities/VendedorDB';
import { DataService } from 'src/app/Infrastructure/Services/data.service';

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
  cliente!: ClienteDB;
  condpg!: CondPagtoDB;
  faixavl!: FaixaValorDB;
  vend!: VendedorDB;

  constructor(
    protected dataService: DataService,
    public dialogRef: MatDialogRef<PedidoImpressaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    private async carregarSeletores() {
      let promises: Promise<any>[] = [];
       promises.push(this.dataService.obterClientePorId(this.data.Dados.Id_Cliente)); 
       promises.push(this.dataService.obterVendedorPorId(this.data.Dados.Id_Vendedor));
      if (this.dataService.condpg.length == 0) {
        promises.push(this.dataService.obterCondPagto()); }
      if (this.dataService.faixavl.length == 0) {
        promises.push(this.dataService.obterFaixaValores()); }
      if (promises.length > 0) {
        await Promise.allSettled(promises).
          then((results) => results.forEach((result) => { 
            if (result.status === 'fulfilled') {
              if (result.value instanceof ClienteDB) {
                this.cliente = result.value as ClienteDB; 
              } else {
                if (result.value instanceof VendedorDB) {
                  this.vend = result.value as VendedorDB; 
                } else {
                  console.log('Type of result.value: Generic object');
                }
              }
            } else {
              console.log('Promise rejected:', result.reason);
            }
           }
            )).
          finally(async () => this.atualizarSeletores().then(() => {
            console.log("Seletores atualizados...");
          }));
      }
      else {
        await this.atualizarSeletores().then(() => {
          console.log("Seletores atualizados...");
        });
      }
    }
  
    private async atualizarSeletores() {
      this.condpg = this.dataService.condpg.filter(x => x.Id == this.data.Dados.Id_Cond_Pagto)[0];
      if (this.condpg) {
        this.faixavl = this.dataService.faixavl.filter(x => x.Id ==this.condpg.Id_FaixaValor)[0];
        this.condpagto = this.condpg.xNome + ' ( até R$ ' + this.faixavl.Valor.toString() + ' )';
      }
    }    

  async ngOnInit(): Promise<void> {
    await this.carregarSeletores();
    this.paginas = Math.ceil((this.data.Dados.PedidosItensDto.length - this.qtdLinPg1) / this.qtdLinPgN);
    if (this.cliente != null) {
      this.endereco = 'Endereço: ' + this.cliente.xLgr + ' ' +
        (this.cliente.xComplemento == null ? '' : this.cliente.xComplemento).trim() +
        ', ' + this.cliente.nro.toString() + ' - ' + this.cliente.cBairro;
      this.cidade = this.cliente.xMun + ' - ' + this.cliente.UF + ', ';
      this.cep = this.cliente.CEP;
      this.telefone = this.cliente.fone == '' ? this.cliente.fone2 : this.cliente.fone;
      if (this.data.Dados.obs) {
        this.obs = this.data.Dados.obs.toString().split('\n').join("<br />");
      }
      if (this.vend) {
        this.vendedor = this.vend.xNome.trim() + ' (' + this.vend.xContato.split(',')[0].trim() + ')'
        this.telvendedor = this.vend.fone;
      }
    }
  }
}