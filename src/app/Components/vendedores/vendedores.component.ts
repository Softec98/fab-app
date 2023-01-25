import { Router } from '@angular/router';
import { Utils } from '../../Utils/Utils';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RegiaoDB } from 'src/app/Core/Entities/RegiaoDB';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar';
import { MatFormField } from '@angular/material/form-field';
import { VendedorDB } from '../../Core/Entities/VendedorDB';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DataService } from '../../Infrastructure/Services/data.service';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CriptografiaService } from 'src/app/Core/Services/criptografia.service';
import { SpinnerOverlayService } from '../../Core/Services/spinner-overlay.service';
import { ImpressaoDialogComponent } from '../impressao-dialog/impressao-dialog.component';
import { ICadastroImpressao, ICadastroTabImpressao } from 'src/app/Core/Interfaces/ICadastroImpressao';

@Component({
  selector: 'app-vendedores',
  templateUrl: './vendedores.component.html',
  styleUrls: ['./vendedores.component.scss']
})
export class VendedoresComponent {

  regioes: RegiaoDB[] = [];
  pessoas: IAuxiliar[] = [];
  displayedColumns: string[] = [];
  form!: FormGroup;
  isPhonePortrait: boolean = false;
  pageSizeOptions: number[] = environment.pageSizeOptions;

  constructor(protected dataService: DataService,
    protected cripto: CriptografiaService,
    private formBuilder: FormBuilder,
    private readonly spinner: SpinnerOverlayService,
    private responsive: BreakpointObserver,
    private dialog: MatDialog,
    private router: Router) {
  }

  private carregarSeletores() {
    const promise1 = this.dataService.obterRegiao();
    const promise2 = this.dataService.obterPessoas();
    Promise.allSettled([promise1, promise2]).
      then((results) => results.forEach((result) => console.log(result.status))).
      finally(async () => this.atualizarSeletores());
  }

  private async atualizarSeletores() {
    this.regioes = this.dataService.regiao;
    this.pessoas = this.dataService.pessoas;
  }

  dataSource!: MatTableDataSource<VendedorDB>;
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
        'codigo',
        'id',
        'xNome',
        'xContato',
        'documento',
        'fone',
        'acoes'];
    }
    else {
      this.displayedColumns = [
        'codigo',
        'id',
        'xNome',
        'acoes'];
    }

    this.form = this.formBuilder.group({
      Pessoa: [''],
      Regiao: ['']
    });
    this.carregarSeletores();

    let vendedores: VendedorDB[] = [];
    const vendedor = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
    if (vendedor && !vendedor.IsAdmin) {
      const filhos = await this.dataService.obterVendedoresFilho(vendedor.Id);
      filhos.push(vendedor.Id);
      vendedores = await this.dataService.obterVendedores(filhos);
    }
    else
      vendedores = await this.dataService.obterVendedores();
    vendedores.map(vendedor => {
      vendedor.Acesso = this.cripto.decryptData(vendedor.Acesso);
    });
    this.dataSource = new MatTableDataSource(vendedores);
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
            const selectArray: string[] = ['Pessoa', 'Regiao'];
            const indice = selectArray.indexOf(filter.split(':')[0]);
            if (indice > -1)
              switch (indice) {
                case 0: {
                  if (Number(valor) == 70) {
                    if ((Utils.isValidCpf(data['Documento']))) {
                      retorno = false;
                    }
                  }
                  if (Number(valor) == 74) {
                    if ((Utils.isValidCnpj(data['Documento']))) {
                      retorno = false;
                    }
                  }
                  break;
                }
                case 1: {
                  if (!(data['IdRegiao'] == valor)) {
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
              data.Documento.toLowerCase().includes(filter) ||
              data.fone.toLowerCase().includes(filter) ||
              data.Celular.toLowerCase().includes(filter) ||
              data.xContato.toLowerCase().includes(filter)
            )
            ? true : false;

        return retorno;
      }
    this.registros = vendedores.length + 1;
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

  async openVendedor(id?: number): Promise<void> {
    this.router.navigate(['/vendedor', id]);
  }

  async openDialogImpressao(id: number, action: string = 'show'): Promise<void> {
    if (typeof id !== 'undefined') {
      //this.spinner.show();
      let tabs = [{ NomeTab: "vendedor", DescricaoTab: "Relação de vendedores" }] as ICadastroTabImpressao[];
      let cadastroImpressao = { Cadastro: "Vendedor", Dados: this.dataSource.data, Tabs: tabs } as ICadastroImpressao;
      this.dialog.open(ImpressaoDialogComponent, { data: cadastroImpressao, width: '800px' });
      this.spinner.hide();
    }
  }
}