import { Observable } from 'rxjs';
import { db } from '../ApplicationDB';
import { Injectable } from '@angular/core';
import { Utils } from 'src/app/Utils/Utils';
import { HttpClient } from '@angular/common/http';
import { ClienteDB } from '../../Core/Entities/ClienteDB';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar';
import { CondPagtoDB } from '../../Core/Entities/CondPagtoDB';

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

  constructor(private http: HttpClient) { }

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

  async obterClientePeloCnpj(cnpj: string) {
    return await db.Clientes.filter(x => x.CNPJ == cnpj).first();
  }

  async obterClientePorId(id: number) {
    return await db.Clientes.get(id);
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

  async obterCondPagto(): Promise<void> {
    if (this.condpg.length == 0) {
      this.condpg = await db.CondPagto.toArray();
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

  async obterPedidos() {
    return await db.Pedidos.orderBy('Id').reverse().toArray();
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
}