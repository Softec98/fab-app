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
import { ProdutoPrecoDB } from '../Core/Entities/ProdutoPrecoDB'
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
import vendedores from '../../assets/data/Vendedores_cripto.json'
import faixaValor from '../../assets/data/FaixaValor.json';
import prodFamilia from '../../assets/data/ProdFamilia.json'

import { Utils } from '../Utils/Utils';
import { IAuxiliar } from '../Core/Interfaces/IAuxiliar';
import { IVendedor_aux } from '../Core/Interfaces/IVendedor_aux';
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

  fretes: IAuxiliar[] = [];
  status: IAuxiliar[] = [];
  clientes: IAuxiliar[] = [];
  clientes_Pedidos: IAuxiliar[] = [];
  vendedores_aux: IVendedor_aux[] = [];

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

    this.on('populate', () => this.populate());
    this.on('ready', () => this.pronto())
  }

  async pronto() {
    if (await db.Produtos.count() > 0) {
      console.log("Banco de dados pronto para uso!");
    }

    if (await db.Clientes.count() > 0) {
      if (this.clientes.length == 0) {
        (await db.Clientes.toArray()).forEach(cliente => {
          this.clientes.push({ key: cliente.Id, value: cliente.xNome })
        });
      }
    }

    if (await db.Vendedores.count() > 0) {
      if (this.vendedores_aux.length == 0) {
        (await db.Vendedores.orderBy('xNome').toArray()).forEach(vendedor => {
          this.vendedores_aux.push({
            key: vendedor.Id,
            value: '[' + vendedor.Codigo.toString().padStart(5, "0") + '] - ' + vendedor.xNome,
            secret: this.cripto.decryptData(vendedor.Acesso)
          });
        });
      }
    }

    if (this.fretes.length == 0) {
      fretesJ.forEach(frete => {
        this.fretes.push({ key: frete.key, value: frete.value });
      });
    }

    if (this.status.length == 0) {
      statusJ.forEach(stat => {
        this.status.push({ key: stat.key, value: stat.value });
      });
    }

    if (await db.Pedidos.count() > 0) {
      let filter: number[] = [];
      await db.Pedidos.orderBy('Id_Cliente').eachUniqueKey((x) => { filter.push(Number(x)); });
      this.clientes_Pedidos = [...await db.Clientes.orderBy('xNome').filter(x =>
        filter.includes(x.Id)).toArray()].map(cliente => <IAuxiliar>
          { key: cliente.Id, value: cliente.xNome });
    }
  }

  async populate() {

    // vendedores.map(vendedor => {
    //   if (/^\d+$/.test(vendedor.Acesso))
    //     vendedor.Acesso = this.cripto.encryptData(vendedor.Acesso);
    // });

    await Promise.all([
      db.NCM.bulkAdd(Utils.ObterLista<NCMDB>(ncm)),
      db.CFOP.bulkAdd(Utils.ObterLista<CFOPDB>(cfop)),
      db.Regioes.bulkAdd(Utils.ObterLista<RegiaoDB>(regiao)),
      db.CondPagto.bulkAdd(Utils.ObterLista<CondPagtoDB>(condPagto)),
      db.Embalagens.bulkAdd(Utils.ObterLista<EmbalagemDB>(embalagem)),
      db.Vendedores.bulkAdd(Utils.ObterLista<VendedorDB>(vendedores)),
      db.FaixaValores.bulkAdd(Utils.ObterLista<FaixaValorDB>(faixaValor)),
      db.ProdutoGrupo.bulkAdd(Utils.ObterLista<ProdutoGrupoDB>(prodGrupo)),
      db.ProdutoPreco.bulkAdd(Utils.ObterLista<ProdutoPrecoDB>(prodPreco)),
      db.Produtos.bulkAdd(Utils.ObterLista<ProdutoDB>(produtos, "ProdutoDB")), // , ProdutoDB.name
      db.ProdutoFamilia.bulkAdd(Utils.ObterLista<ProdutoFamiliaDB>(prodFamilia)),
    ]);
  }

  preencherClientesPedidos(aux: IAuxiliar[]) {
    this.clientes_Pedidos = aux;
  }
}

export const db = new ApplicationDB(new CriptografiaService());
export const familiaJson = prodFamilia;
export const embalagemJson = embalagem;
export const grupoJson = prodGrupo;
export const precoJson = prodPreco;
export const ncmJson = ncm;
export const status = db.status;
export const fretes = db.fretes;
export const clientes = db.clientes;
export const produtoJson = produtos;
export const vendedores_aux = db.vendedores_aux;

export class DynamicClass {
  constructor(className: string, opts: any) {
    if (Store[className] === undefined || Store[className] === null) {
      throw new Error(`A classe do tipo \'${className}\' não está na armazenador (store).`);
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