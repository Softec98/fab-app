import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { PedidoDto } from '../../Core/Dto/PedidoDto';
import { MatDialog } from '@angular/material/dialog';
import { db } from '../../Infrastructure/ApplicationDB';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar';
import { MatFormField } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table'
import { LoginService } from 'src/app/Core/Services/login.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DataService } from '../../Infrastructure/Services/data.service';
import { SpinnerOverlayService } from '../../Core/Services/spinner-overlay.service';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ImpressaoDialogComponent } from '../impressao-dialog/impressao-dialog.component';
import { ICadastroImpressao, ICadastroTabImpressao } from 'src/app/Core/Interfaces/ICadastroImpressao';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit {

  clientes: IAuxiliar[] = [];
  status: IAuxiliar[] = [];
  fretes: IAuxiliar[] = [];
  form!: FormGroup;
  isPhonePortrait: boolean = false;

  constructor(
    protected loginService: LoginService,
    protected dataService: DataService,
    //private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private readonly spinner: SpinnerOverlayService,
    private responsive: BreakpointObserver,
    private dialog: MatDialog,
    private router: Router) {
  }

  private carregarSeletores() {
    const promise1 = this.dataService.obterFretes();
    const promise2 = this.dataService.obterStatus();
    const promise3 = this.dataService.obterPedidosIdClientes();
    Promise.allSettled([promise1, promise2, promise3]).
      then((results) => results.forEach((result) => console.log(result.status))).
      finally(async () => this.atualizarSeletores());
  }

  private async atualizarSeletores() {
    this.status = this.dataService.status;
    this.fretes = this.dataService.fretes;
    this.clientes = [...await this.dataService.obterClientes(this.dataService.clientesIds)].map(cliente =>
      <IAuxiliar>{ key: cliente.Id, value: cliente.xNome });
    db.preencherClientesPedidos(this.clientes);
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

    this.carregarSeletores();
    let pedidos = [...await this.dataService.obterPedidos(this.loginService.ObterIdUsuario())].map(pedido => new PedidoDto(pedido));
    this.dataSource = new MatTableDataSource(pedidos);
    if (pedidos.length > 0 && typeof pedidos[0].NomeCliente == 'undefined') {
      pedidos[0].NomeCliente = (await this.dataService.obterClientePorId(pedidos[0].Id_Cliente))?.xNome!
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

  async openDialogImpressao(id: number, action: string = 'show'): Promise<void> {
    if (typeof id !== 'undefined') {
      this.spinner.show();
      let pedido = new PedidoDto(await this.dataService.obterPedidoPorId(id)!);
      pedido.action = action;
      let tabs = [{ NomeTab: "pedido", DescricaoTab: "Visualização pedido" },
                  { NomeTab: "guia", DescricaoTab: "Guia de expedição" }] as ICadastroTabImpressao[];
      let cadastroImpressao = { Cadastro: "Pedido", Dados: pedido, Tabs: tabs } as ICadastroImpressao;
      this.dialog.open(ImpressaoDialogComponent, { data: cadastroImpressao, width: '800px' });
      this.spinner.hide();
    }
  }

  async apagarPedido(id: number) {
    if (confirm("Deseja realmente apagar o pedido?")) {
      await this.dataService.apagarPedido(id);
      this.ngOnInit();
    }
  }
}