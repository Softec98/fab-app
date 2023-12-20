import { Injectable } from '@angular/core';
import { PlanilhaDto } from '../Dto/PlanilhaDto';
import { Observable, retry, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GoogleApiRequest } from '../Dto/GoogleApiRequest ';
import { googleApiJson } from 'src/app/Infrastructure/ApplicationDB';
import { UsuarioDto } from '../Dto/UsuarioDto';

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {
  
  private ncm: any;
  private cfop: any;
  private regiao: any;
  private fretes: any;
  private status: any;
  private produtos: any;
  private prodGrupo: any;
  private condPagto: any;
  private prodPreco: any;
  private embalagem: any;
  private vendedores: any;
  private faixaValor: any;
  private prodFamilia: any;
  private Token: string | undefined;
    
  constructor(private http: HttpClient) { }
    
  async obterApi(entidade: string, id?: string | undefined) { // : Promise<Observable<any | undefined>> 
    
    if (!this.Token) {
      var usuario = localStorage.getItem('usuario');
      if (usuario) {
        var usuarioDto = new UsuarioDto(JSON.parse(usuario));
        if (usuarioDto)
          this.Token = usuarioDto.Token;
      }
   }
    
    let retorno = this.atualizarRetorno(entidade);
    if (retorno && retorno !== undefined) 
      return <any>retorno;
    else {
      var tabela = localStorage.getItem(`Sales_${entidade}`);
      if (tabela != null && tabela != 'undefined') {
        var planilha = new PlanilhaDto(JSON.parse(tabela!));
        if (planilha.objetoRetorno) {
          return this.atualizarRetorno(entidade, planilha);
        }
      }
      var urlApi = new GoogleApiRequest(googleApiJson, entidade, id?.toString()).url!
      if (this.Token) {
        urlApi += `${(urlApi.indexOf("?") == -1 ? '?' : '&')}Authorization=${this.Token}`;
      }
      // var data = this.http.get<any>(urlApi)
      //                  .pipe(
      //                      timeout(30000),
      //                      retry(3)
      //                  );

      return await fetch(urlApi).then(res => res.json())
        .then(data => {
          return data;
        });
    }
  }

  async obterTokenApi(user: string, password: string) : Promise<Observable<any | undefined>> {
    var urlApi = GoogleApiRequest.BuscarTokenApi(googleApiJson, user, password)!
    // var data = this.http.get<any>(urlApi)
    //   .pipe(
    //       timeout(30000),
    //       retry(3)
    //   );   
    return await fetch(urlApi).then(res => res.json())
      .then(data => {
        this.Token = data?.objetoRetorno?.Token!;
        return data;
      });
  }

  private atualizarRetorno(nome: string, entidade: any = undefined): any {
    let retorno: any = entidade;
    switch (nome) {
        case 'NCM':
          if (entidade !== undefined) {
            this.ncm = entidade; }
          retorno = this.ncm;
          break;
        case 'CFOP':
          if (entidade !== undefined) {
            this.cfop = entidade; }
          retorno = this.cfop;
          break;
        case 'Regiao':
          if (entidade !== undefined) {
            this.regiao = entidade; }
          retorno = this.regiao;
          break;
        case 'Frete':
          if (entidade !== undefined) {
            this.fretes = entidade; }
          retorno = this.fretes;
          break;
        case 'Status':
          if (entidade !== undefined) {
            this.status = entidade; }
          retorno = this.status;
          break;
        case 'Produto':
          if (entidade !== undefined) {
            this.produtos = entidade; }
          retorno = this.produtos;
          break;
        case 'ProdGrupo':
          if (entidade !== undefined) {
            this.prodGrupo = entidade; }
          retorno = this.prodGrupo;
          break;
        case 'CondPagto':
          if (entidade !== undefined) {
            this.condPagto = entidade; }
          retorno = this.condPagto;
          break;
        case 'ProdPreco':
          if (entidade !== undefined) {
            this.prodPreco = entidade; }
          retorno = this.prodPreco;
          break;
        case 'Embalagem':
          if (entidade !== undefined) {
            this.embalagem = entidade; }
          retorno = this.embalagem;
          break;
        case 'FaixaValor':
          if (entidade !== undefined) {
            this.faixaValor = entidade; }
          retorno = this.faixaValor;
          break;
        case 'Vendedor':
          if (entidade !== undefined) {
            this.vendedores = entidade; }
          retorno = this.vendedores;
          break;
        case 'ProdFamilia':
          if (entidade !== undefined) {
            this.prodFamilia = entidade; }
          retorno = this.prodFamilia;
          break;
    }
    return retorno;
  }
}