import { Observable } from 'rxjs';
import { db } from '../ApplicationDB';
import { Injectable } from '@angular/core';
import { Utils } from 'src/app/Utils/Utils';
import { HttpClient } from '@angular/common/http';
import { RegiaoDB } from 'src/app/Core/Entities/RegiaoDB';
import { ClienteDB } from '../../Core/Entities/ClienteDB';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar';
import { CondPagtoDB } from '../../Core/Entities/CondPagtoDB';
import { VendedorDB } from 'src/app/Core/Entities/VendedorDB';
import vendedores from '../../../assets/data/Vendedores_cripto.json';
import { FaixaValorDB } from 'src/app/Core/Entities/FaixaValorDB';
import { CriptografiaService } from 'src/app/Core/Services/criptografia.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  status: IAuxiliar[] = [];
  fretes: IAuxiliar[] = [];
  condpg: CondPagtoDB[] = [];
  pessoas: IAuxiliar[] = [];
  estados: IAuxiliar[] = [];
  clientesIds: number[] = [];
  faixavl: FaixaValorDB[] = [];
  regiao: RegiaoDB[] = [];

  constructor(
    private http: HttpClient,
    protected cripto: CriptografiaService) { }

  async obterCFOP() {
    return await db.CFOP.toArray();
  }

  async obterProdutos(filter: string = '') {
    if (filter == '')
      return await db.Produtos.toArray();
    else
      return await db.Produtos.filter(x =>
        x.xProd.toLowerCase().includes(filter.toLowerCase())).toArray();
  }

  ObterEstados(): Observable<IAuxiliar[]> {
    return this.http.get<any[]>('./assets/data/Estados.json');
  }

  async obterClientes(filter: number[] = []) {
    if (filter.length == 0)
      return await db.Clientes.orderBy('xNome').toArray();
    else
      return await db.Clientes.orderBy('xNome')
        .filter(x => filter.includes(x.Id)).toArray();
  }

  async obterClientesPorVendedor(filter: number[] = []) {
    if (filter.length == 0)
      return await db.Clientes.orderBy('xNome').toArray();
    else
      return await db.Clientes.orderBy('xNome')
        .filter(x => filter.includes(x.Id_Vendedor)).toArray();
  }

  async obterVendedores(filter: number[] = []) {
    if (filter.length == 0)
      return await db.Vendedores.orderBy('xNome').toArray();
    else
      return await db.Vendedores.orderBy('xNome')
        .filter(x => filter.includes(x.Id)).toArray();
  }

  async obterVendedoresFilho(id: number): Promise<number[]> {
    let filter: number[] = [];
    (await db.Vendedores.filter(x => x.IdPai == id).toArray()).forEach(vendedor => {
      filter.push(vendedor.Id);
    });
    return filter;
  }

  async obterClientePeloCnpj(cnpj: string) {
    return await db.Clientes.filter(x => x.CNPJ == cnpj).first();
  }

  async obterVendedorPeloDocumento(cnpj: string) {
    return await db.Vendedores.filter(x => x.Documento == cnpj).first();
  }

  async obterClientePorId(id: number) {
    return await db.Clientes.get(id);
  }

  async obterVendedorPorId(id: number) {
    return await db.Vendedores.get(id);
  }

  async salvarCliente(data: ClienteDB): Promise<number> {
    await db.transaction('rw', db.Clientes, function () {
      db.Clientes.put(data);
    }).catch(function (err) {
      console.error(err.stack || err);
    });
    db.clientes = [];
    (await db.Clientes.toArray()).forEach(cliente => {
      db.clientes.push({ key: cliente.Id, value: cliente.xNome })
    });
    return data.Id;
  }

  async salvarVendedor(data: VendedorDB): Promise<number> {
    await db.transaction('rw', db.Vendedores, function () {
      db.Vendedores.put(data);
    }).catch(function (err) {
      console.error(err.stack || err);
    });
    return data.Id;
  }

  async obterCondPagto(): Promise<void> {
    if (this.condpg.length == 0) {
      this.condpg = await db.CondPagto.toArray();
    }
  }

  async obterFaixaValores(): Promise<void> {
    if (this.faixavl.length == 0) {
      this.faixavl = await db.FaixaValores.toArray();
    }
  }

  async obterRegiao(): Promise<void> {
    if (this.regiao.length == 0) {
      this.regiao = await db.Regioes.toArray();
    }
  }

  async obterCondPagtoPorId(id: number) {
    await this.obterCondPagto();
    return this.condpg.find(x => x.Id == id);
  }

  async obterFretes(): Promise<void> {
    if (this.fretes.length == 0) {
      await Utils.getAuxiliar(`Frete`).then((aux) => {
        this.fretes = aux;
      });
    }
  }

  async obterStatus(): Promise<void> {
    if (this.status.length == 0) {
      await Utils.getAuxiliar(`Status`).then((aux) => {
        this.status = aux;
      });
    }
  }

  async obterPessoas(): Promise<void> {
    if (this.pessoas.length == 0) {
      await Utils.getAuxiliar(`Pessoas`).then((aux) => {
        this.pessoas = aux;
      });
    }
  }

  async obterUF(): Promise<void> {
    if (this.estados.length == 0) {
      await Utils.getAuxiliar(`Estados`).then((aux) => {
        this.estados = aux;
      });
    }
  }

  async obterPedidos(id_vendedor: number = 1) {
    if (id_vendedor == 1) {
      return await db.Pedidos.orderBy('Id').reverse().toArray();
    }
    else {
      return await db.Pedidos.where('Id_Vendedor').equals(id_vendedor).reverse().sortBy('Id');
    }
  }

  async obterPedidoPorId(id: number) {
    return await db.Pedidos.get(id);
  }

  async obterPedidosIdClientes() {
    this.clientesIds = [];
    await db.Pedidos.orderBy('Id_Cliente').eachUniqueKey((x) => {
      this.clientesIds.push(Number(x));
    });
  }

  async apagarPedido(id: number) {
    await db.transaction('rw', db.Pedidos, function () {
      db.Pedidos.delete(id);
    }).catch(function (err) {
      console.error(err.stack || err);
    });
  }

  async apagarCliente(id: number) {
    await db.transaction('rw', db.Clientes, function () {
      db.Clientes.delete(id);
    }).catch(function (err) {
      console.error(err.stack || err);
    });
  }

  async obterVendedorPelasCredenciais(login: string, acesso: string) {
    let vendedor = await db.Vendedores.filter(x => x.Login == login && this.cripto.decryptData(x.Acesso) == acesso).first();
    if (vendedor) {
      vendedor.UltimoAcesso = new Date();
      await this.salvarVendedor(vendedor);
    }
    return vendedor;
  }

  async cadastrarVendedoresSeNenhum() {
    if ((await db.Vendedores.toArray()).length == 0) {
      // vendedores.map(vendedor => {
      //   if (/^\d+$/.test(vendedor.Acesso))
      //     vendedor.Acesso = this.cripto.encryptData(vendedor.Acesso);
      // });
      console.log(JSON.stringify(vendedores));
      await db.Vendedores.bulkAdd(Utils.ObterLista<VendedorDB>(vendedores));
    }
  }
}