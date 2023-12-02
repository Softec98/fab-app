import { PedidoDto } from '../Dto/PedidoDto';
import { Injectable, OnInit } from '@angular/core';
import { IAuxiliar } from '../Interfaces/IAuxiliar';
import { MatDialog } from '@angular/material/dialog';
import { EmbalagemDB } from '../Entities/EmbalagemDB';
import { ProdutoGrupoDB } from '../Entities/ProdutoGrupoDB';
import { ProdutoPrecoDB } from '../Entities/ProdutoPrecoDB';
import { IVendedor_aux } from '../Interfaces/IVendedor_aux';
import { ProdutoFamiliaDB } from '../Entities/ProdutoFamiliaDB';
import { SpinnerOverlayService } from './spinner-overlay.service';
import { DataService } from 'src/app/Infrastructure/Services/data.service';
import { ICadastroImpressao, ICadastroTabImpressao } from '../Interfaces/ICadastroImpressao';
import { ImpressaoDialogComponent } from 'src/app/Components/impressao-dialog/impressao-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PedidoImpressaoService {

  clientes: IAuxiliar[] = [];
  status: IAuxiliar[] = [];
  frete: IAuxiliar[] = [];
  vendedores: IVendedor_aux[] = [];
  familia: ProdutoFamiliaDB[] = [];
  grupo: ProdutoGrupoDB[] = [];
  preco: ProdutoPrecoDB[] = [];
  embalagem: EmbalagemDB[] = [];  

  constructor(
    protected dataService: DataService,
    private readonly spinner: SpinnerOverlayService,
    private dialog: MatDialog) { }

    private async carregarSeletores() {
      let promises: Promise<void>[] = [];
      if (this.dataService.fretes.length == 0) {
        promises.push(this.dataService.obterFretes()); }
      if (this.dataService.status.length == 0) {
        promises.push(this.dataService.obterStatus()); }
      if (this.dataService.clientes_aux.length == 0) {
        promises.push(this.dataService.obterPedidosIdClientes()); }
      if (this.dataService.vendedores_aux.length == 0) {
        promises.push(this.dataService.preencherVendedores()); }
      if (this.dataService.familia.length == 0) {
        promises.push(this.dataService.obterFamilia()); }
      if (this.dataService.grupo.length == 0) {
        promises.push(this.dataService.obterGrupo()); }      
      if (this.dataService.embalagem.length == 0) {
        promises.push(this.dataService.ObterEmbalagem()); }
      if (this.dataService.preco.length == 0) {
        promises.push(this.dataService.obterProdPreco()); }         
      if (promises.length > 0) {
        await Promise.allSettled(promises).
          then((results) => results.forEach((result) => console.log(result.status))).
          finally(async () => this.atualizarSeletores().then(() => {
            console.log("Seletores atualizados...");
          }));
      }
      else {
        this.atualizarSeletores().then(() => {
          console.log("Seletores atualizados...");
        });
      }
    }
  
    private async atualizarSeletores() {
      this.status = this.dataService.status;
      this.frete = this.dataService.fretes;
      this.clientes = this.dataService.clientes_aux;
      this.vendedores = this.dataService.vendedores_aux;
      this.familia = this.dataService.familia;
      this.grupo = this.dataService.grupo;
      this.embalagem = this.dataService.embalagem;
      this.preco = this.dataService.preco;
    }    

  async openDialogImpressao(id: number, action: string = 'show'): Promise<void> {
    if (typeof id !== 'undefined') {

      this.spinner.show();

      await this.carregarSeletores();

       let retorno: any;
       await this.dataService.obterPedidoPorId(id)!.then(data =>{
          retorno = data;
       });

      let pedidoDto = new PedidoDto(
        retorno, 
        this.clientes, 
        this.vendedores, 
        this.frete, 
        this.status,
        this.familia,
        this.grupo,
        this.embalagem,
        this.preco);

      pedidoDto.action = action;
      let tabs = [{ NomeTab: "pedido", DescricaoTab: "Visualização pedido" },
                  { NomeTab: "guia", DescricaoTab: "Guia de expedição" }] as ICadastroTabImpressao[];
      let cadastroImpressao = { Cadastro: "Pedido", Dados: pedidoDto, Tabs: tabs } as ICadastroImpressao;
      this.dialog.open(ImpressaoDialogComponent, { data: cadastroImpressao, width: '800px' });
      
      this.spinner.hide();
    }
  }
}