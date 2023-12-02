import { Utils } from 'src/app/Utils/Utils';
import { MatSort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';
import { NCMDB } from 'src/app/Core/Entities/NCMDB';
import { PedidoDB } from '../../Core/Entities/PedidoDB';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoDB } from '../../Core/Entities/ProdutoDB';
import { ClienteDB } from '../../Core/Entities/ClienteDB';
import { MatTableDataSource } from '@angular/material/table';
import { PedidoListaDto } from '../../Core/Dto/PedidoListaDto'
import { PedidoItemDB } from '../../Core/Entities/PedidoItemDB';
import { CondPagtoDB } from 'src/app/Core/Entities/CondPagtoDB';
import { EmbalagemDB } from 'src/app/Core/Entities/EmbalagemDB';
import { FaixaValorDB } from 'src/app/Core/Entities/FaixaValorDB';
import { LoginService } from 'src/app/Core/Services/login.service';
import { IVendedor_aux } from 'src/app/Core/Interfaces/IVendedor_aux';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProdutoPrecoDB } from 'src/app/Core/Entities/ProdutoPrecoDB';
import { ProdutoGrupoDB } from 'src/app/Core/Entities/ProdutoGrupoDB';
import { DataService } from '../../Infrastructure/Services/data.service';
import { ProdutoFamiliaDB } from 'src/app/Core/Entities/ProdutoFamiliaDB';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SpinnerOverlayService } from 'src/app/Core/Services/spinner-overlay.service';
import cliente_validation from '../../../assets/data/validation/cliente-validation.json'
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, HostListener } from '@angular/core';

export class Group {
  level = 0;
  expanded = false;
  totalCounts = 0;
}

@Component({
  selector: 'lista-preco.component',
  styleUrls: ['lista-preco.component.scss'],
  templateUrl: 'lista-preco.component.html',
})

export class ListaPrecoComponent implements OnInit {

  validation_messages = cliente_validation;

  public dataSource = new MatTableDataSource<any | Group>([]);

  columns: any[];
  displayedColumns: string[];
  groupByColumns: string[] = [];
  allData!: any[];
  _allGroup!: any[];
  expandedProduto: any[] = [];
  expandedSubProduto: PedidoListaDto[] = [];
  
  condpg: CondPagtoDB[] = [];
  faixavl: FaixaValorDB[] = [];
  grupo: ProdutoGrupoDB[] =[];
  familia: ProdutoFamiliaDB[] =[];
  embalagem: EmbalagemDB[] = [];
  preco: ProdutoPrecoDB[] = [];
  ncm: NCMDB[] = [];
  produto: ProdutoDB[] = [];
  vendedores: IVendedor_aux[] = [];
  
  edicao: boolean = false;
  edicaoQtde: boolean = false;
  edicaoVenda: boolean = false;
  campo: string = '';
  isPhonePortrait: boolean = false;
  idPedido!: number;
  idUltimoPedido!: number;
  editRowId: number = -1
  obs!: string;
  idCondPagto!: number;
  idVendedor!: number;
  idFaixaValor: number = 1;
  pedido!: PedidoDB;

  @ViewChildren(MatInput, { read: ElementRef }) inputs: QueryList<ElementRef> | undefined;
  @ViewChild(MatSort) sort!: MatSort;

  public form!: FormGroup;

  constructor(
    protected loginService: LoginService,
    protected dataService: DataService,
    private formBuilder: FormBuilder,
    private router: Router,
    private responsive: BreakpointObserver,
    private activatedRoute: ActivatedRoute,
    private spinner: SpinnerOverlayService
  ) {
    this.columns = [
      {
        display: 'Código',
        field: 'cProd'
      }, {
        display: 'UN.',
        field: 'Unid'
      }, {
        display: 'Descrição',
        field: 'xProd'
      }, {
        display: 'Qtde',
        field: 'qProd'
      }, {
        display: 'Preço',
        field: 'vVenda'
      }];

    this.displayedColumns = this.columns.map(column => column.field);
    this.groupByColumns = ['Familia'];
    this.dataSource.sort = this.sort;
  }

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
      id: [0],
      cnpj: this.formBuilder.control({ value: '', disabled: false }, Utils.isDocumento()),
      IE: [''],
      nome: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(/^[a-zA-Z].*[\s\.]*$/),
        Validators.maxLength(100),
        Validators.minLength(5)
      ])),
      fantasia: [''],
      cep: [''],
      endereco: [''],
      complemento: [''],
      numero: [''],
      bairro: [''],
      cidade: [''],
      uf: [''],
      me: [''],
      ddd: [''],
      ddd2: [''],
      email: ['', Validators.email],
      fone: ['', Validators.pattern(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4}|d{5})[-. ]?(\d{4})[-. ]?\s*$/)],
      fone2: ['', Validators.pattern(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4}|d{5})[-. ]?(\d{4})[-. ]?\s*$/)],
      pais: ['']
    });

    await this.carregarSeletores();
    
    this.idPedido = Number(this.activatedRoute.snapshot.params["id"]);
    if (this.idPedido > 0) {
      this.pedido = <PedidoDB>(await this.dataService.obterPedidoPorId(this.idPedido));
      if (this.pedido && this.pedido.obs) {
        this.obs = this.pedido.obs;
      }
      if (this.pedido && this.pedido.Id_Cond_Pagto) {
        this.idCondPagto = this.pedido.Id_Cond_Pagto;
      }
      if (this.pedido && this.pedido.Id_Vendedor) {
        this.idVendedor = this.pedido.Id_Vendedor;
      }
      const cliente = await this.dataService.obterClientePorId(this.pedido?.Id_Cliente!)
      if (cliente && cliente.CNPJ) {
        this.form.patchValue({
          cnpj: cliente.CNPJ,
        });
      }
      if (this.allData) {
        if (this.pedido && this.pedido.PedidosItens) {
          this.pedido.PedidosItens.forEach(item => {
            let index = this.allData.findIndex(x => x["Id"] == item.Id_Produto)
            if (index > -1) {
              this.allData[index].qProd = item.qProd;
              this.allData[index].vVenda = item.vProd;
            }
          });
          this.RetornarFaixaValor();
        }
      }
    }

    this.spinner.hide();
  }

  private async carregarSeletores() {
    let promises: Promise<void>[] = [];
    if (this.dataService.familia.length == 0) {
       promises.push(this.dataService.obterFamilia()) }
    if (this.dataService.preco.length == 0) {
       promises.push(this.dataService.obterProdPreco()); }
    if (this.dataService.embalagem.length == 0) {
       promises.push(this.dataService.ObterEmbalagem()); }
    if (this.dataService.faixavl.length == 0) {
      promises.push(this.dataService.obterFaixaValores()); }
    if (this.dataService.condpg.length == 0) {
      promises.push(this.dataService.obterCondPagto()); }
    if (this.dataService.ncm.length == 0) {
      promises.push(this.dataService.obterNCM()); }
    if (this.dataService.grupo.length == 0) {
      promises.push(this.dataService.obterGrupo()); }
    if (this.dataService.vendedores_aux.length == 0) {
      promises.push(this.dataService.preencherVendedores()); }
    if (this.dataService.produto.length == 0) {
        promises.push(this.dataService.obterProdutos()); }      
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
    let produto = this.dataService.produto;
    this.produto = produto;    
    const familia = this.dataService.familia;
    this.familia = familia;
    const preco = this.dataService.preco;
    this.preco = preco;
    const embalagem = this.dataService.embalagem;
    this.embalagem = embalagem;
    const faixavl = this.dataService.faixavl
    this.faixavl = faixavl;
    const condpg = this.dataService.condpg;
    this.condpg = condpg;
    const ncm = this.dataService.ncm;
    this.ncm = ncm;
    const grupo = this.dataService.grupo;
    this.grupo = grupo;
    let vendedores = this.dataService.vendedores_aux;
    this.vendedores = vendedores;
    this.ObterListaDePreco();
  }

  edit(row: number, element: string) {
    this.edicao = !this.edicao;
    if (this.edicao) {
      this.editRowId = row;
      setTimeout(() => {
        const campo_editavel = this.inputs!.find(x => x.nativeElement.getAttribute('name') == element)!
        if (campo_editavel != null) {
          campo_editavel.nativeElement.select();
          campo_editavel.nativeElement.focus();
        }
      }, 0);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.length == 0 || filterValue.length > 2) {
      this.ObterListaDePreco(filterValue);
    }
  }

  groupHeaderClick(row: any) {
    if (row.expanded) {
      row.expanded = false;
      this.dataSource.data = this.getGroups(this.allData, this.groupByColumns);
    } else {
      row.expanded = true;
      this.expandedProduto = row;
      this.dataSource.data = this.addGroupsNew(this._allGroup, this.allData, this.groupByColumns, row);
    }
  }

  getGroups(data: any[], groupByColumns: string[]): any[] {
    const rootGroup = new Group();
    rootGroup.expanded = false;
    return this.getGroupList(data, 0, groupByColumns, rootGroup);
  }

  getGroupList(data: any[], level: number = 0, groupByColumns: string[], parent: Group): any[] {
    if (level >= groupByColumns.length) {
      return data;
    }
    let groups = this.uniqueBy(
      data?.map(
        row => {
          let result = new Group();
          result.level = level + 1;
          for (let i = 0; i <= level; i++) {
            (result as any)[groupByColumns[i]] = row[groupByColumns[i]];
          }
          return result;
        }
      ),
      JSON.stringify);

    const currentColumn = groupByColumns[level];

    groups?.forEach((group: { [x: string]: any; totalCounts: number; }) => {
      const rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn]);
      group.totalCounts = rowsInGroup.length;
      this.expandedSubProduto = [];
    });

    groups = groups?.sort((a: ProdutoDB, b: ProdutoDB) => {
      const isAsc = 'asc';
      return this.compare(a.Id_Produto_Familia, b.Id_Produto_Familia, isAsc);

    });
    this._allGroup = groups;
    return groups;
  }

  addGroupsNew(allGroup: any[], data: any[], groupByColumns: string[], dataRow: any): any[] {
    const rootGroup = new Group();
    rootGroup.expanded = true;
    return this.getSublevelNew(allGroup, data, 0, groupByColumns, rootGroup, dataRow);
  }

  getSublevelNew(allGroup: any[], data: any[], level: number, groupByColumns: string[],
    parent: Group, dataRow: any): any[] {
    if (level >= groupByColumns.length) {
      return data;
    }
    const currentColumn = groupByColumns[level];
    let subGroups: any = [];
    allGroup.forEach(group => {
      const rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn]);
      group.totalCounts = rowsInGroup.length;

      if (group.Familia == dataRow.Familia.toString()) {
        group.expanded = dataRow.expanded;
        const subGroup = this.getSublevelNew(allGroup, rowsInGroup, level + 1, groupByColumns,
          group, dataRow.Familia.toString());
        this.expandedSubProduto = subGroup;
        subGroup.unshift(group);
        subGroups = subGroups.concat(subGroup);
      } else {
        subGroups = subGroups.concat(group);
      }
    });
    return subGroups;
  }

  uniqueBy(a: any, key: any) {
    const seen: any = {};
    return a?.filter((item: any) => {
      const k: string = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  isGroup(index: number, item: any): boolean {
    return item.level;
  }

  onSortData(sort: MatSort) {
    let data = this.allData;
    const index = data.findIndex(x => x['level'] == 1);
    if (sort.active && sort.direction !== '') {
      if (index > -1) {
        data.splice(index, 1);
      }

      data = data.sort((a: PedidoListaDto, b: PedidoListaDto) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'cProd':
            return this.compare(a.cProd, b.cProd, isAsc);
          case 'Unid':
            return this.compare(a.Unid, b.Unid, isAsc);
          case 'xProd':
            return this.compare(a.xProd, b.xProd, isAsc);
          case 'vVenda':
            return this.compare(a.vVenda, b.vVenda, isAsc);
          case 'Familia':
            return this.compare(a.Familia, b.Familia, isAsc);
          default:
            return 0;
        }
      });
    }
    this.dataSource.data = this.addGroupsNew(this._allGroup, data, this.groupByColumns, this.expandedProduto);
    console.log('Sort');
  }

  AlgumProdutoComQtde(): boolean {
    if (this.allData)
      for (let row of this.allData) {
        if (row.Id != 0 && row.qProd > 0) {
          return true;
        }
      }
    return false;
  }

  scroll(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    element?.focus();
  }

  private compare(a: any, b: any, isAsc: any) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  private ObterListaDePreco(filterValue: string = '') {
    this.allData = this.produto.filter(x => x.xProd.toLowerCase().includes(filterValue.toLowerCase())).map(prod => 
      new PedidoListaDto(prod, this.familia, this.embalagem, this.preco));
    this.dataSource.data = this.getGroups(this.allData, this.groupByColumns);
  }

  @HostListener('click', ['$event.target'])
  onClick(e: HTMLElement) {
    if (e.getAttribute('role') === 'cell') {
      if (e.parentElement?.getAttribute('role') === 'row') {
        this.edicaoQtde = false;
        this.edicaoVenda = false;
        this.campo = Array.from(e.classList).
          find(x => x.indexOf('cdk-column-') > -1)?.replace('cdk-column-', '')!;
        switch (this.campo) {
          case "qProd":
            this.edicaoQtde = true;
            break;
          case "vVenda":
            this.edicaoVenda = true;
            break;
        }
      }
    }
  }

  getColumns(): any[] {
    this.columns = this.isPhonePortrait ?
      this.columns :
      this.columns.filter(x => x.field !== 'Unid')
    this.displayedColumns = this.columns.map(column => column.field);
    return this.columns;
  }

  async Salvar() {
    if (typeof this.idCondPagto == 'undefined' || this.idCondPagto == -1) {
      alert("Por favor, selecione a condição de pagamento antes de salvar o pedido.");
      return;
    }
    this.spinner.show();
    const ncm = this.ncm; 
    let idCliente = 0;
    let uf = ''
    let salvarUltPedido: boolean = true;
    let cnpj: string = this.form.controls['cnpj'].value.match(/\d/g)?.join('');
    if (typeof cnpj !== 'undefined' && cnpj !== null && cnpj !== '' &&
      (cnpj.length == 11 || cnpj.length == 14) && this.form.controls['cnpj'].valid) {
      let cliente = new ClienteDB();
      if (this.form.controls['id'].value != '0') {
        cliente.Id = this.form.controls['id'].value;
        if (cliente.Id && cliente.Id > 0) {
          cliente = <ClienteDB>(await this.dataService.obterClientePorId(cliente.Id));
          salvarUltPedido = false;
        }
      }
      else {
        cliente.Id_Vendedor = this.loginService.ObterIdUsuarioPai();
      }
      cliente.CNPJ = cnpj;
      cliente.IE = this.form.controls['IE'].value;
      cliente.xNome = this.form.controls['nome'].value;
      cliente.xFantasia = this.form.controls['fantasia'].value;
      cliente.CEP = this.form.controls['cep'].value;
      cliente.xLgr = this.form.controls['endereco'].value;
      cliente.nro = this.form.controls['numero'].value;
      cliente.xComplemento = this.form.controls['complemento'].value;
      cliente.cBairro = this.form.controls['bairro'].value;
      cliente.xMun = this.form.controls['cidade'].value;
      cliente.UF = this.form.controls['uf'].value;
      cliente.indME = this.form.controls['me'].value;
      cliente.cPais = this.form.controls['pais'].value;
      cliente.email = this.form.controls['email'].value;
      cliente.fone = this.form.controls['ddd'].value + ' ' + this.form.controls['fone'].value;
      cliente.fone2 = this.form.controls['ddd2'].value + ' ' + this.form.controls['fone2'].value;
      uf = cliente.UF;
      idCliente = await this.dataService.salvarCliente(cliente);
      this.form.patchValue({
        id: idCliente
      });
    }

    if (idCliente > 0) {
      let condpg = await this.dataService.obterCondPagtoPorId(this.idCondPagto);
      let pedido = new PedidoDB();
      if (this.idPedido && this.idPedido > 0) {
        pedido = <PedidoDB>(await this.dataService.obterPedidoPorId(this.idPedido)!);
      }
      else {
        salvarUltPedido = true;
        pedido.Id_Status = 1;
        pedido.Id_Pagto_Codigo = 1;
        pedido.datCadastro = new Date();
        pedido.datEmissao = new Date();
      }
      pedido.PedidosItens = [];
      pedido.Parcelas = condpg?.Dias09 != null ? 9 : condpg?.Dias08 != null ? 8 : condpg?.Dias07 != null ? 7 :
        condpg?.Dias06 != null ? 6 : condpg?.Dias05 != null ? 5 : condpg?.Dias04 != null ? 4 :
          condpg?.Dias03 != null ? 3 : condpg?.Dias02 != null ? 2 : condpg?.Dias01 != null ? 1 : 0;
      pedido.Id_Cliente = idCliente;
      pedido.obs = this.obs;
      pedido.Frete = condpg?.Frete!
      pedido.Id_Cond_Pagto = this.idCondPagto;
      pedido.Id_Vendedor = this.loginService.IsAdministrador() ? this.idVendedor : this.loginService.ObterIdUsuario();
      if (this.allData) {
        this.allData = this.allData.filter(function (x) { return x.qProd > 0 });
        const itensQtd = this.allData;
        itensQtd.map(item => {
          let pedidoItem = new PedidoItemDB();
          pedidoItem.Id_Produto = item.Id;
          pedidoItem.NCM = ncm?.find(x => item.Id_NCM == x.Id)?.NCM!;
          pedidoItem.CFOP = uf == 'SP' ? 5101 : 6101;
          pedidoItem.Unid = item.Unid;
          pedidoItem.cProd = item.cProd;
          pedidoItem.xProd = item.xProd;
          pedidoItem.qProd = item.qProd;
          pedidoItem.vProd = item.vVenda;
          pedidoItem.vMerc = item.qProd * item.vVenda;
          pedidoItem.Id_Produto_Familia = item.Id_Produto_Familia;
          pedidoItem.Id_Produto_Grupo = item.Id_Produto_Grupo;
          pedido.PedidosItens.push(pedidoItem);
          pedido.Totalizar();
        });
      }
      const idPedido = await pedido.Salvar();
      this.spinner.hide();
      if (salvarUltPedido && !this.idPedido) {
        let cliente = await this.dataService.obterClientePorId(idCliente);
        if (cliente !== null) {
          let alterado = new ClienteDB(cliente);
          alterado.IdPedidoUltimo = idPedido;
          await this.dataService.salvarCliente(alterado);
        }
      }
    }
    this.spinner.hide();
    alert("O pedido foi salvo com sucesso!");
    this.router.navigate(['/pedidos']);
  }

  RetornarFaixaValor() {
    let idFaixaValor = this.idFaixaValor;
    let valorTotal: number = this.Totalizar();
    if (valorTotal > 0) {
      if (valorTotal < this.faixavl[0].Valor) {
        idFaixaValor = 1;
      }
      else if (valorTotal > this.faixavl[this.faixavl.length - 1].Valor) {
        idFaixaValor = this.faixavl.length;
      }
      else {
        for (let i = 0; i < this.faixavl.length; i++) {
          if (this.faixavl[i].Valor > valorTotal) {
            idFaixaValor = this.faixavl[i].Id as number;
            break;
          }
        }
      }
    }
    this.idFaixaValor = idFaixaValor;
  }

  Totalizar(): number {
    let vMerc: number = 0;
    if (typeof (this.allData) != 'undefined') {
      vMerc = this.allData.reduce<number>((soma, item) => { return soma + item.qProd * item.vVenda; }, 0);
    }
    return vMerc;
  }

  obterCondPagto() {
    let condpg = this.condpg.filter(x => x.Id_FaixaValor == this.idFaixaValor);
    this.idCondPagto = condpg.find(x => x.Id == this.idCondPagto)?.Id ?? -1;
    return condpg;
  }

  obterVendedores() {
    return this.vendedores;
  }
}