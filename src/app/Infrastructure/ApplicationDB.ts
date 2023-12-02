import Dexie, { Table } from 'dexie';

import { NCMDB } from '../Core/Entities/NCMDB';
import { CFOPDB } from '../Core/Entities/CFOPDB';
import { RegiaoDB } from '../Core/Entities/RegiaoDB';
import { PedidoDB } from '../Core/Entities/PedidoDB';
import { ClienteDB } from '../Core/Entities/ClienteDB';
import { ProdutoDB } from '../Core/Entities/ProdutoDB';
import { VendedorDB } from '../Core/Entities/VendedorDB';
import { CondPagtoDB } from '../Core/Entities/CondPagtoDB';
import { EmbalagemDB } from '../Core/Entities/EmbalagemDB';
import { FaixaValorDB } from '../Core/Entities/FaixaValorDB';
import { PedidoItemDB } from '../Core/Entities/PedidoItemDB';
import { ProdutoGrupoDB } from '../Core/Entities/ProdutoGrupoDB';
import { ProdutoPrecoDB } from '../Core/Entities/ProdutoPrecoDB';
import { ProdutoFamiliaDB } from '../Core/Entities/ProdutoFamiliaDB';

import ncm from '../../assets/data/NCM.json'; 
import cfop from '../../assets/data/CFOP.json';
import regiao from '../../assets/data/Regiao.json';
import fretesJ from '../../assets/data/Frete.json'
import statusJ from '../../assets/data/Status.json'
import produtos from '../../assets/data/Produtos.json'
import prodGrupo from '../../assets/data/ProdGrupo.json'
import condPagto from '../../assets/data/CondPagto.json'
import prodPreco from '../../assets/data/ProdPreco.json'
import embalagem from '../../assets/data/Embalagem.json';
import faixaValor from '../../assets/data/FaixaValor.json';
import prodFamilia from '../../assets/data/ProdFamilia.json'
import vendedores from '../../assets/data/Vendedores_cripto.json'
import googleApi from '../../assets/data/Google.API.EndPoints.json'

import { Utils } from '../Utils/Utils';
import { IAuxiliar } from '../Core/Interfaces/IAuxiliar';
import { environment } from 'src/environments/environment';
import { CriptografiaService } from '../Core/Services/criptografia.service';

export class ApplicationDB extends Dexie {

  CFOP!: Table<CFOPDB, number>;
  Clientes!: Table<ClienteDB, number>;
  CondPagto!: Table<CondPagtoDB, number>;
  Embalagens!: Table<EmbalagemDB, number>;
  NCM!: Table<NCMDB, number>;
  Pedidos!: Table<PedidoDB, number>;
  PedidosItens!: Table<PedidoItemDB, number>;
  ProdutoFamilia!: Table<ProdutoFamiliaDB, number>;
  ProdutoGrupo!: Table<ProdutoGrupoDB, number>;
  ProdutoPreco!: Table<ProdutoPrecoDB, number>;
  Produtos!: Table<ProdutoDB, number>;
  Vendedores!: Table<VendedorDB, number>;
  Regioes!: Table<RegiaoDB, number>;
  FaixaValores!: Table<FaixaValorDB, number>;

  isLocal: boolean = environment.pathDB.toLowerCase() == "local"
  clientes_aux: IAuxiliar[] = [];
  erro: boolean = false;

  ncm: any;
  cfop: any;
  regiao: any;
  fretesJ: any;
  statusJ: any;
  produtos: any;
  prodGrupo: any;
  condPagto: any;
  prodPreco: any;
  embalagem: any;
  vendedores: any;
  faixaValor: any;
  prodFamilia: any;

  constructor(protected cripto: CriptografiaService) {
    
    super('FabAppDB');

    this.version(1).stores({
        CFOP: '++Id',
        CondPagto: '++Id',
        Clientes: '++Id, xNome, CNPJ, IdPedidoUltimo, Id_Vendedor',
        Embalagens: '++Id',
        NCM: '++Id',
        Pedidos: '++Id, Id_Cliente, Id_Vendedor',
        PedidosItens: '++Id, Id_Pedido, Id_Produto',
        ProdutoFamilia: '++Id, Id_Embalagem',
        ProdutoGrupo: '++Id, Id_NCM',
        ProdutoPreco: '++Id, Id_Cond_Pagto, cProd, Id_Produto_Familia, Id_Produto_Grupo',
        Produtos: '++Id, cProd, xProd, Id_Produto_Familia, Id_Produto_Grupo, Id_Embalagem, Id_NCM',
        Vendedores: '++Id, xNome, Documento, Id_Regiao',
        Regioes: '++Id, xNome',
        FaixaValores: '++Id'
      });

      this.NCM.mapToClass(NCMDB);
      this.CFOP.mapToClass(CFOPDB);
      this.Regioes.mapToClass(RegiaoDB);
      this.Pedidos.mapToClass(PedidoDB);
      this.Produtos.mapToClass(ProdutoDB);
      this.Clientes.mapToClass(ClienteDB);
      this.CondPagto.mapToClass(CondPagtoDB);
      this.Vendedores.mapToClass(VendedorDB);
      this.Embalagens.mapToClass(EmbalagemDB);
      this.FaixaValores.mapToClass(FaixaValorDB);
      this.PedidosItens.mapToClass(PedidoItemDB);
      this.ProdutoGrupo.mapToClass(ProdutoGrupoDB);
      this.ProdutoPreco.mapToClass(ProdutoPrecoDB);
      this.ProdutoFamilia.mapToClass(ProdutoFamiliaDB);

      this.ncm = ncm;
      this.cfop = cfop;
      this.regiao = regiao;
      this.fretesJ = fretesJ;
      this.statusJ = statusJ;
      this.produtos = produtos;
      this.prodGrupo = prodGrupo;
      this.condPagto = condPagto;
      this.prodPreco = prodPreco;
      this.embalagem = embalagem;
      this.vendedores = vendedores;
      this.faixaValor = faixaValor;
      this.prodFamilia = prodFamilia;
    
    if (this.isLocal)
      this.on('populate', () => db.populate());
    
    this.on('ready', () => db.pronto())
  }

  async pronto() {

      if (this.isLocal && await db.Produtos.count() > 0) {
        console.log("Banco de dados pronto para uso!");
      }
  }

  async populate() {

    // vendedores.map(vendedor => {
    //   if (/^\d+$/.test(vendedor.Acesso))
    //     vendedor.Acesso = db.cripto.encryptData(vendedor.Acesso);
    // });

    await Promise.all([
      this.NCM.bulkAdd(Utils.ObterLista<NCMDB>(db.ncm)),
      this.CFOP.bulkAdd(Utils.ObterLista<CFOPDB>(db.cfop)),
      this.Regioes.bulkAdd(Utils.ObterLista<RegiaoDB>(db.regiao)),
      this.CondPagto.bulkAdd(Utils.ObterLista<CondPagtoDB>(db.condPagto)),
      this.Embalagens.bulkAdd(Utils.ObterLista<EmbalagemDB>(db.embalagem)),
      this.Vendedores.bulkAdd(Utils.ObterLista<VendedorDB>(db.vendedores)),
      this.FaixaValores.bulkAdd(Utils.ObterLista<FaixaValorDB>(db.faixaValor)),
      this.ProdutoGrupo.bulkAdd(Utils.ObterLista<ProdutoGrupoDB>(db.prodGrupo)),
      this.ProdutoPreco.bulkAdd(Utils.ObterLista<ProdutoPrecoDB>(db.prodPreco)),
      this.Produtos.bulkAdd(Utils.ObterLista<ProdutoDB>(db.produtos, "ProdutoDB")), // , ProdutoDB.name
      this.ProdutoFamilia.bulkAdd(Utils.ObterLista<ProdutoFamiliaDB>(db.prodFamilia)),
    ]);
  }
}

export const db = new ApplicationDB(new CriptografiaService());
export const googleApiJson = googleApi;
export const IsLocal = environment.pathDB.toLowerCase() == "local";

export class DynamicClass {
  constructor(className: string, opts: any) {
    if (Store[className] === undefined || Store[className] === null) {
      throw new Error(`A classe do tipo \'${className}\' não está no armazenador (store).`);
    }
    return new Store[className](opts);
  }
}

export const Store: any = {
  CFOPDB,
  ClienteDB,
  CondPagtoDB,
  EmbalagemDB,
  NCMDB,
  PedidoDB,
  PedidoItemDB,
  ProdutoFamiliaDB,
  ProdutoGrupoDB,
  ProdutoPrecoDB,
  ProdutoDB,
  VendedorDB,
  RegiaoDB,
  FaixaValorDB
}

export class ProdutosSemListaDePreco {
  public cProd!: string;
  public xProd!: string;

  public constructor(init?: Partial<ProdutosSemListaDePreco>) {
    Object.assign(this, init);
  }

  toString(): string {
    return `Código: ${this.cProd}, Nome: '${this.xProd}'.`;
  }
}