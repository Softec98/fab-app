import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { PedidoDto } from '../../Core/Dto/PedidoDto';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar';
import { MatFormField } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table'
import { EmbalagemDB } from 'src/app/Core/Entities/EmbalagemDB';
import { LoginService } from 'src/app/Core/Services/login.service';
import { ProdutoGrupoDB } from 'src/app/Core/Entities/ProdutoGrupoDB';
import { ProdutoPrecoDB } from 'src/app/Core/Entities/ProdutoPrecoDB';
import { IVendedor_aux } from 'src/app/Core/Interfaces/IVendedor_aux';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DataService } from '../../Infrastructure/Services/data.service';
import { ProdutoFamiliaDB } from 'src/app/Core/Entities/ProdutoFamiliaDB';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SpinnerOverlayService } from 'src/app/Core/Services/spinner-overlay.service';
import { PedidoImpressaoService } from 'src/app/Core/Services/pedido-impressao.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit {

  clientes: IAuxiliar[] = [];
  status: IAuxiliar[] = [];
  frete: IAuxiliar[] = [];
  vendedores: IVendedor_aux[] = [];
  familia: ProdutoFamiliaDB[] = [];
  grupo: ProdutoGrupoDB[] = [];
  preco: ProdutoPrecoDB[] = [];
  embalagem: EmbalagemDB[] = [];  
  form!: FormGroup;
  isPhonePortrait: boolean = false;

  constructor(
    protected loginService: LoginService,
    protected dataService: DataService,
    private formBuilder: FormBuilder,
    private responsive: BreakpointObserver,
    private router: Router,
    protected pedidoImpressaoService: PedidoImpressaoService,
    private readonly spinner: SpinnerOverlayService) {
  }

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
      await this.atualizarSeletores().then(() => {
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

  displayedColumns = [
    'id',
    'datEmissao',
    'nomeFrete',
    'nomeCliente',
    'valTotal',
    'nomeStatus',
    'acoes'];

  dataSource!: MatTableDataSource<PedidoDto>;
  registros: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  async ngOnInit(): Promise<void> {

    this.spinner.show();

    this.responsive.observe([
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this.isPhonePortrait = false;
      if (!result.matches) {
        this.isPhonePortrait = true;
      }
    });

    this.form = this.formBuilder.group({
      Frete: [''],
      Id_Cliente: [''],
      Id_Status: ['']
    });

    await this.carregarSeletores();

    let pedidos: PedidoDto[] = [];
    const tabela = await this.dataService.obterPedidos(
      this.loginService.ObterIdUsuario(), this.loginService.IsAdministrador());
    if (tabela) {
      pedidos = [...tabela].map(pedido => 
        new PedidoDto(
          pedido, 
          this.clientes, 
          this.vendedores, 
          this.frete, 
          this.status,
          this.familia,
          this.grupo,
          this.embalagem,
          this.preco));
      if (pedidos) {
        this.dataSource = new MatTableDataSource(pedidos);
      }

      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
      }, 0);

      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate =
        (data: any, filter: string) => {
          let retorno: boolean = true;
          if (filter.includes(':')) {
            const valor: string = filter.split(':')[1].toString();
            if (valor !== '-1') {
              const selectArray: string[] = ['Id_Cliente', 'Frete', 'Id_Status'];
              const indice = selectArray.indexOf(filter.split(':')[0]);
              if (indice > -1)
                retorno = data[selectArray[indice]] == valor
            }
          }
          else
            retorno = filter.length < 3 || data.NomeCliente.toLowerCase().includes(filter) ? true : false;
          return retorno;
      }
      this.registros = pedidos.length + 1;
    }
    this.spinner.hide();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onselect(selecao: any) {
    this.dataSource.filter = selecao.source.ngControl.name + ':' + selecao.source.value.toString();
  }

  @ViewChildren(MatFormField) formFields!: QueryList<MatFormField>;

  async openPedido(id?: number): Promise<void> {
    this.router.navigate(['/novo_pedido', id]);
  }

  async apagarPedido(id: number) {
    if (confirm("Deseja realmente apagar o pedido?")) {
      await this.dataService.apagarPedido(id);
      this.ngOnInit();
    }
  }
}