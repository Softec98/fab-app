import { Router } from '@angular/router';
import { Utils } from '../../Utils/Utils';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { PedidoDto } from '../../Core/Dto/PedidoDto';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClienteDB } from '../../Core/Entities/ClienteDB';
import { MatPaginator } from '@angular/material/paginator';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar';
import { MatFormField } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DataService } from '../../Infrastructure/Services/data.service';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SpinnerOverlayService } from '../../Core/Services/spinner-overlay.service';
import { ImpressaoDialogComponent } from '../impressao-dialog/impressao-dialog.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent {

  estados: IAuxiliar[] = [];
  pessoas: IAuxiliar[] = [];
  displayedColumns: string[] = [];
  form!: FormGroup;
  isPhonePortrait: boolean = false;

  constructor(protected dataService: DataService,
    private formBuilder: FormBuilder,
    private readonly spinner: SpinnerOverlayService,
    private responsive: BreakpointObserver,
    private dialog: MatDialog,
    private router: Router) {
  }

  private carregarSeletores() {
    const promise1 = this.dataService.obterUF();
    const promise2 = this.dataService.obterPessoas();
    Promise.allSettled([promise1, promise2]).
      then((results) => results.forEach((result) => console.log(result.status))).
      finally(async () => this.atualizarSeletores());
  }

  private async atualizarSeletores() {
    this.estados = this.dataService.estados;
    this.pessoas = this.dataService.pessoas;
  }

  dataSource!: MatTableDataSource<ClienteDB>;
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

    if (this.isPhonePortrait) {
      this.displayedColumns = [
        'id',
        'xNome',
        'cNPJ',
        'fone',
        'xMun',
        'uF',
        'idPedidoUltimo',
        'acoes'];
    }
    else {
      this.displayedColumns = [
        'id',
        'xNome',
        'acoes'];
    }

    this.form = this.formBuilder.group({
      Pessoa: [''],
      Estado: ['']
    });

    this.carregarSeletores();
    let clientes = await this.dataService.obterClientes()
    this.dataSource = new MatTableDataSource(clientes);
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
            const selectArray: string[] = ['Pessoa', 'Estado'];
            const indice = selectArray.indexOf(filter.split(':')[0]);
            if (indice > -1)
              switch (indice) {
                case 0: {
                  if (Number(valor) == 70) {
                    if ((Utils.isValidCpf(data['CNPJ']))) {
                      retorno = false;
                    }
                  }
                  if (Number(valor) == 74) {
                    if ((Utils.isValidCnpj(data['CNPJ']))) {
                      retorno = false;
                    }
                  }
                  break;
                }
                case 1: {
                  if (!(data['UF'] == valor)) {
                    retorno = false;
                  }
                  break;
                }
              }
          }
        }
        else
          retorno = filter.length < 2 ||
            (
              data.xNome.toLowerCase().includes(filter) ||
              data.CNPJ.toLowerCase().includes(filter) ||
              data.fone.toLowerCase().includes(filter) ||
              data.xMun.toLowerCase().includes(filter) ||
              data.UF.toLowerCase().includes(filter)
            )
            ? true : false;

        return retorno;
      }
    this.registros = clientes.length + 1;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onselect(selecao: any) {
    this.dataSource.filter = selecao.source.ngControl.name + ':' + selecao.source.value.toString();
  }

  @ViewChildren(MatFormField) formFields!: QueryList<MatFormField>;

  async openCliente(id?: number): Promise<void> {
    this.router.navigate(['/novo_cliente', id]);
  }

  async openDialogImpressao(id: number, action: string = 'show'): Promise<void> {
    if (typeof id !== 'undefined') {
      this.spinner.show();
      let pedido = new PedidoDto(await this.dataService.obterPedidoPorId(id)!);
      pedido.action = action;
      this.dialog.open(ImpressaoDialogComponent, { data: pedido, width: '800px' });
      this.spinner.hide();
    }
  }

  async apagarCliente(id: number) {
    if (confirm("Deseja realmente apagar o cliente?")) {
      await this.dataService.apagarCliente(id);
      this.ngOnInit();
    }
  }
}