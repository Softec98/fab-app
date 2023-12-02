import { Injectable } from '@angular/core';
import { Utils } from 'src/app/Utils/Utils';
import { db, IsLocal } from '../ApplicationDB';
import { HttpClient } from '@angular/common/http';
import { NCMDB } from 'src/app/Core/Entities/NCMDB';
import { CFOPDB } from 'src/app/Core/Entities/CFOPDB';
import { RegiaoDB } from 'src/app/Core/Entities/RegiaoDB';
import { ClienteDB } from '../../Core/Entities/ClienteDB';
import { PedidoDB } from 'src/app/Core/Entities/PedidoDB';
import { IAuxiliar } from '../../Core/Interfaces/IAuxiliar';
import { ProdutoDB } from 'src/app/Core/Entities/ProdutoDB';
import { CondPagtoDB } from '../../Core/Entities/CondPagtoDB';
import { VendedorDB } from 'src/app/Core/Entities/VendedorDB';
import { EmbalagemDB } from 'src/app/Core/Entities/EmbalagemDB';
import { FaixaValorDB } from 'src/app/Core/Entities/FaixaValorDB';
import { ProdutoPrecoDB } from 'src/app/Core/Entities/ProdutoPrecoDB';
import { ProdutoGrupoDB } from 'src/app/Core/Entities/ProdutoGrupoDB';
import { IVendedor_aux } from 'src/app/Core/Interfaces/IVendedor_aux';
import { ProdutoFamiliaDB } from 'src/app/Core/Entities/ProdutoFamiliaDB';
import { GoogleApiService } from 'src/app/Core/Services/google.api.service';
import { CriptografiaService } from 'src/app/Core/Services/criptografia.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  pessoas: IAuxiliar[] = [];
  estados: IAuxiliar[] = [];
  clientesIds: number[] = [];

  status: IAuxiliar[] = [];
  fretes: IAuxiliar[] = [];
  condpg: CondPagtoDB[] = [];
  faixavl: FaixaValorDB[] = [];
  regiao: RegiaoDB[] = [];
  cfop: CFOPDB[] =[];
  ncm: NCMDB[] =[];
  grupo: ProdutoGrupoDB[] = [];
  familia: ProdutoFamiliaDB[] = [];
  preco: ProdutoPrecoDB[] = [];
  embalagem: EmbalagemDB[] = [];
  produto: ProdutoDB[] = [];

  estados_aux: IAuxiliar[] = [];
  vendedores_aux: IVendedor_aux[] = [];
  clientes_aux: IAuxiliar[] = [];
  
  constructor(
    private http: HttpClient,
    protected cripto: CriptografiaService,
    protected googleApiService: GoogleApiService) { }
    
  async obterCFOP() {
    if (this.cfop.length == 0) {
     let retorno: CFOPDB[] | undefined;
     if (IsLocal) {
        retorno =  await db.CFOP.toArray(); }
     else {
        retorno = [...(<any>await this.googleApiService.obterApi('CFOP')).
          objetoRetorno]?.map(cf => new CFOPDB(cf)); }
     this.cfop = retorno;
    }
  }

  async obterNCM() {
    if (this.ncm.length == 0) {
      let retorno: NCMDB[] | undefined;
      if (IsLocal) {
        retorno =  await db.NCM.toArray(); }
      else {
        retorno = [...(<any>await this.googleApiService.obterApi('NCM')).
          objetoRetorno]?.map(ncm => new NCMDB(ncm)); }
      this.ncm = retorno;
    }
  }

  async obterFamilia() {
    if (this.familia.length == 0) {
    let retorno: ProdutoFamiliaDB[] | undefined;
    if (IsLocal) {
       retorno =  await db.ProdutoFamilia.toArray(); }
     else {
       retorno = [...(<any>await this.googleApiService.obterApi('ProdFamilia')).
        objetoRetorno]?.map(pf => new ProdutoFamiliaDB(pf)); }
     this.familia = retorno;
    }
  }

  async obterGrupo() {
    if (this.grupo.length == 0) {
    let retorno: ProdutoGrupoDB[] | undefined;
    if (IsLocal) {
       retorno =  await db.ProdutoGrupo.toArray(); }
     else {
       retorno = [...(<any>await this.googleApiService.obterApi('ProdGrupo')).
        objetoRetorno]?.map(pg => new ProdutoGrupoDB(pg)); }
     this.grupo = retorno;
    }
  }

  async ObterEmbalagem() {
    if (this.embalagem.length == 0) {
    let retorno: EmbalagemDB[] | undefined;
    if (IsLocal) {
       retorno =  await db.Embalagens.toArray(); }
     else {
       retorno = [...(<any>await this.googleApiService.obterApi('Embalagem')).
        objetoRetorno]?.map(emb => new EmbalagemDB(emb)); }
     this.embalagem = retorno;
    }
  }

  async obterProdPreco() {
    if (this.preco.length == 0) {
      let retorno: ProdutoPrecoDB[] | undefined;
      if (IsLocal) {
        retorno =  await db.ProdutoPreco.toArray(); }
      else {
        retorno = [...(<any>await this.googleApiService.obterApi('ProdPreco')).
          objetoRetorno]?.map(pp => new ProdutoPrecoDB(pp)); }
      this.preco = retorno;
    }
  }

  async obterProdutos(filter: string = '') {
    if (this.produto.length == 0) {
      let retorno: ProdutoDB[] | undefined;
      if (IsLocal) {
        if (filter == '')
          retorno = (await db.Produtos.toArray()).map(prod => 
            new ProdutoDB(
              prod, 
              this.embalagem, 
              this.familia, 
              this.grupo, 
              this.preco));
        else
          retorno = (await db.Produtos.filter(x =>
            x.xProd.toLowerCase().includes(filter.toLowerCase())).toArray()).map(prod => 
              new ProdutoDB(
                prod, 
                this.embalagem, 
                this.familia, 
                this.grupo, 
                this.preco));
      }
      else {
        if (filter == '')
          retorno = [...(<any>await this.googleApiService.obterApi('Produto'))?.objetoRetorno]?.map(produto => 
              new ProdutoDB(produto, this.embalagem, this.familia, this.grupo, this.preco));
        else
          retorno = ([...(<any>await this.googleApiService.obterApi('Produto'))?.objetoRetorno]?.map(produto => 
              new ProdutoDB(produto, this.embalagem, this.familia, this.grupo, this.preco))).
                filter(x => x.xProd.toLowerCase().includes(filter.toLowerCase()));
      }
      this.produto = retorno;
    }
  }

  async obterClientes(filter: number[] = []) {
    let retorno: ClienteDB[] = [];
    if (IsLocal) {
      if (filter.length == 0)
      retorno = await db.Clientes.orderBy('xNome').toArray();
      else
      retorno = await db.Clientes.orderBy('xNome')
          .filter(x => filter.includes(x.Id)).toArray();
    }
    else {
      if (filter.length == 0) {
        retorno = [...(<any>await this.googleApiService.obterApi('Cliente')).
          objetoRetorno]?.map(cli => new ClienteDB(cli));
      }
      else {
        retorno = [...(<any>await this.googleApiService.obterApi('Cliente')).
          objetoRetorno]?.map(cli => new ClienteDB(cli)).filter(x => filter.includes(x.Id));
      }
    }
    return retorno;
  }

  async obterClientesPorVendedor(filter: number[] = []) {
    if (IsLocal) {
      if (filter.length == 0)
        return await db.Clientes.orderBy('xNome').toArray();
      else
        return await db.Clientes.orderBy('xNome')
          .filter(x => filter.includes(x.Id_Vendedor)).toArray();
    }
    else
      if (filter.length == 0)
        return [...(<any>await this.googleApiService.obterApi('Cliente')).
          objetoRetorno]?.map(cli => new ClienteDB(cli));
      else
        return [...(<any>await this.googleApiService.obterApi('Cliente')).
          objetoRetorno]?.map(cli => new ClienteDB(cli)).filter(x => filter.includes(x.Id_Vendedor));
  }

  async obterVendedores(filter: number[] = []) {
    let retorno: VendedorDB[] = [];
    if (IsLocal) {
      if (filter.length == 0)
        retorno = await db.Vendedores.orderBy('xNome').toArray();
      else
        retorno = await db.Vendedores.orderBy('xNome')
          .filter(x => filter.includes(x.Id)).toArray();
    }
    else
      if (filter.length == 0)
        retorno = [...(<any>await this.googleApiService.obterApi('Vendedor')).
          objetoRetorno]?.map(vend => new VendedorDB(vend));
      else
        retorno = ([...(<any>await this.googleApiService.obterApi('Vendedor')).
          objetoRetorno]?.map(vend => new VendedorDB(vend))).filter(x => filter.includes(x.Id));

    return retorno;
  }

  async obterVendedoresFilho(id: number): Promise<number[]> {
    let filter: number[] = [];
    if (IsLocal) 
      (await db.Vendedores.filter(x => x.IdPai == id).toArray()).forEach(vendedor => {
        filter.push(vendedor.Id);
      });
    else
      (([...(<any>await this.googleApiService.obterApi('Vendedor')).objetoRetorno]?.
        map(vend => new VendedorDB(vend))).filter(x => x.IdPai == id)).
        forEach(vendedor => { filter.push(vendedor.Id);
      });

    return filter;
  }

  async obterClientePeloCnpj(cnpj: string) {
    return IsLocal ?
      await db.Clientes.filter(x => x.CNPJ == cnpj).first() :
      [...(<any>await this.googleApiService.obterApi('Cliente')).objetoRetorno]?.
        map(cli => new ClienteDB(cli)).filter(x => x.CNPJ == cnpj)[0];

  }

  async obterVendedorPeloDocumento(cnpj: string) {
    let retorno: VendedorDB | undefined;
    if (IsLocal) {
      retorno = await db.Vendedores.filter(x => x.Documento == cnpj).first(); }
    else {
      retorno = [...(<any>await this.googleApiService.obterApi('Vendedor')).objetoRetorno]?.
        map(vend => new VendedorDB(vend)).filter(x => x.Documento == cnpj)[0]; }
    return retorno;
  }

  async obterClientePorId(id: number) {
    let retorno: ClienteDB | undefined;
    if (IsLocal) {
      retorno = await db.Clientes.get(id); }
    else {
      await this.googleApiService.obterApi('Cliente', id.toString()).then((data: any) => {
        retorno = [...data.objetoRetorno].map(cliente => new ClienteDB(cliente))[0];
      });  
    }
    return retorno;
  }

  async obterVendedorPorId(id: number) {
    let retorno: VendedorDB | undefined;
    if (IsLocal) {
      retorno = await db.Vendedores.get(id); }
    else {
      retorno = [...(<any>await this.googleApiService.obterApi('Vendedor')).objetoRetorno]?.
        map(cli => new VendedorDB(cli)).filter(x => x.Id == id)[0]; }
    return retorno;
  }

  async salvarCliente(data: ClienteDB): Promise<number> {
    await db.transaction('rw', db.Clientes, function () {
      db.Clientes.put(data);
    }).catch(function (err) {
      console.error(err.stack || err);
    });
    db.clientes_aux = [];
    (await db.Clientes.toArray()).forEach(cliente => {
      db.clientes_aux.push({ key: cliente.Id, value: cliente.xNome })
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
      this.condpg = IsLocal ? 
        await db.CondPagto.toArray() : 
        [...(<any>await this.googleApiService.obterApi('CondPagto')).
          objetoRetorno]?.map(cp => new CondPagtoDB(cp));
    }
  }

  async obterFaixaValores(): Promise<void> {
    if (this.faixavl.length == 0) {
      this.faixavl = IsLocal ? 
        await db.FaixaValores.toArray() :
        [...(<any>await this.googleApiService.obterApi('FaixaValor')).
          objetoRetorno].map(fv => new FaixaValorDB(fv));
    }
  }

  async obterRegiao(): Promise<void> {
    if (this.regiao.length == 0) {
      this.regiao = IsLocal ? 
        await db.Regioes.toArray() :
        [...(<any>await this.googleApiService.obterApi('Regiao')).
          objetoRetorno].map(rg => new RegiaoDB(rg));
    }
  }

  async obterCondPagtoPorId(id: number) {
    await this.obterCondPagto();
    return this.condpg.find(x => x.Id == id);
  }

  async obterFretes(): Promise<void> {
    if (this.fretes.length == 0) {
      if (IsLocal)
        await Utils.getAuxiliar(`Frete`).then((aux) => {
          this.fretes = aux;
        });
      else 
        await this.googleApiService.obterApi('Frete').
          then((data: any) => {  
            let fretes: IAuxiliar[] = [];
            if (data.isOk && data.objetoRetorno.length > 0) {
              data.objetoRetorno.forEach((estado: IAuxiliar) => {
                fretes.push({
                  key: estado.key,
                  value: estado.value });
              });
            }
            this.fretes = fretes;
        });
    }
  }

  async obterStatus(): Promise<void> {
    if (this.status.length == 0) {
      if (IsLocal)
        await Utils.getAuxiliar(`Status`).then((aux) => {
          this.status = aux;
        });
      else
        await this.googleApiService.obterApi('Status').
          then((data: any) => { 
            let status: IAuxiliar[] = [];
            if (data.isOk && data.objetoRetorno.length > 0) {
              data.objetoRetorno.forEach((stat: IAuxiliar) => {
                status.push({
                  key: stat.key,
                  value: stat.value });
            });
          }
          this.status = status;
        });      
    }
  }

  async obterPessoas(): Promise<void> {
    if (this.pessoas.length == 0) {
      if (IsLocal)
          await Utils.getAuxiliar(`Pessoas`).then((aux) => {
            this.pessoas = aux;
        });
      else
        await this.googleApiService.obterApi('Pessoa').
          then((data: any) => { 
            let pessoas: IAuxiliar[] = [];
            if (data.isOk && data.objetoRetorno.length > 0) {
              data.objetoRetorno.forEach((pessoa: IAuxiliar) => {
                pessoas.push({
                  key: pessoa.key,
                  value: pessoa.value });
            });
          }
          this.pessoas = pessoas;
        });
    }
  }

  async obterUF(): Promise<void> {
    if (this.estados.length == 0) {
      if (IsLocal)
          await Utils.getAuxiliar(`Estados`).then((aux) => {
          this.estados = aux;
        });
      else
        await this.googleApiService.obterApi('Estado').
          then((data: any) => { 
            let estados: IAuxiliar[] = [];
            if (data && data.isOk && data.objetoRetorno.length > 0) {
              data.objetoRetorno.forEach((estado: IAuxiliar) => {
                estados.push({
                  key: estado.key,
                  value: estado.value });
            });
          }
          this.estados = estados;
        });
    }
  }

  async obterPedidos(id_vendedor: number = 1, is_admin: boolean) {
    let retorno: PedidoDB[] | undefined;
    if (IsLocal) {
      if (is_admin) {
        retorno = await db.Pedidos.orderBy('Id').reverse().toArray();
      }
      else {
        retorno = await db.Pedidos.where('Id_Vendedor').equals(id_vendedor).reverse().sortBy('Id');
      }
    }
    else {
      if (is_admin) {
        retorno = [...(<any>await this.googleApiService.obterApi('Pedido')).
          objetoRetorno]?.map(pedido => new PedidoDB(pedido));
      }
      else {
        retorno = [...(<any>await this.googleApiService.obterApi('Pedido')).
          objetoRetorno]?.map(pedido => new PedidoDB(pedido)).filter(x => x.Id_Vendedor == id_vendedor);
      }      
    }
    return retorno;
  }

  async obterPedidoPorId(id: number) {
    let retorno: PedidoDB | undefined;
    if (IsLocal) {
      retorno = await db.Pedidos.get(id); }
    else {
      retorno = [...(<any>await this.googleApiService.obterApi('Pedido', id.toString())).
        objetoRetorno].map(pedido => new PedidoDB(pedido))[0];

      //  await this.googleApiService.obterApi('Pedido', id.toString()).then((data: any) => 
      //    retorno = [...data.objetoRetorno].map(pedido => 
      //     new PedidoDB(pedido))[0]
      //    );
    }
    return retorno;
  }

  async obterPedidosIdClientes() {
    this.clientesIds = [];
    if (IsLocal) {
      await db.Pedidos.orderBy('Id_Cliente').eachUniqueKey((x) => { this.clientesIds.push(Number(x)); });
    }
    else {
      this.clientesIds = Array.from(
        new Set((<any>await this.googleApiService.obterApi('Pedido')).
          objetoRetorno.map((x: Partial<PedidoDB> | undefined) => new PedidoDB(x).Id_Cliente )));
    }
    this.preencherClientesPedidos()
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
    let vendedor = IsLocal ?
      await db.Vendedores.filter(x => x.Login == login && this.cripto.decryptData(x.Acesso) == acesso).first() :
      ([...(<any>await this.googleApiService.obterApi('Vendedor')).objetoRetorno].
        map(vend => new VendedorDB(vend))).filter(x => x.Login == login && this.cripto.decryptData(x.Acesso) == acesso)[0];

    if (vendedor) {
      vendedor.UltimoAcesso = new Date();
      await this.salvarVendedor(vendedor);
    }
    return vendedor;
  }

  async cadastrarVendedoresSeNenhum() {
    if (IsLocal && (await db.Vendedores.toArray()).length == 0) {
      // vendedores.map(vendedor => {
      //   if (/^\d+$/.test(vendedor.Acesso))
      //     vendedor.Acesso = this.cripto.encryptData(vendedor.Acesso);
      // });
      await db.Vendedores.bulkAdd(Utils.ObterLista<VendedorDB>(db.vendedores));
    }
  }

  async preencherClientesPedidos() {
    this.clientes_aux = [...await this.obterClientes(this.clientesIds)].
      map(cliente => <IAuxiliar>{ key: cliente.Id, value: cliente.xNome });
  }

  async preencherVendedores() {
    if (this.vendedores_aux.length == 0) {
      this.vendedores_aux = [...await this.obterVendedores()].
        map(vend => <IVendedor_aux>{ 
          key: vend.Id, 
          value: '[' + vend.Codigo.toString().padStart(5, "0") + '] - ' + vend.xNome,
          secret: this.cripto.decryptData(vend.Acesso) 
        });
    }
  }
}