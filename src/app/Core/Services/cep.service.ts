import { catchError, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { throwError } from 'rxjs/internal/observable/throwError';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CepService {

  private defaultLang: string = 'pt-BR';

  constructor(private http: HttpClient) { }

  cabec = { NONE: 0, JSON: 1, FILE: 2, BLOB: 3, BLOBS: 4 };
  erroCep: boolean = false;

  ObterEndereco(_cep: string, id_api: number = 1) {
    const tam = this.defaultLang == 'en' ? 5 : 8;
    let fonte = id_api;
    let cep = _cep.replace(/-/i, '').replace('_', '');
    if (cep.length < tam || !cep.match(/\d+/g)) {
      const mensagem = this.defaultLang == 'en' ?
        `Validation: ZipCode must be at least ${tam} digits long.` :
        `Validação: O CEP deve conter ${tam} dígitos!`;
      alert(mensagem);
      return of({});
    }
    else {
      let baseApi = environment.zipCodeEndPoint_us;
      if (environment.defaultLang !== 'en') {
        baseApi = environment.zipCodeEndPoint_pt_BR;
      }
      let api = baseApi.filter(function (x) { return x.Id === fonte })[0];
      const httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'application/json'
        })
      };
      let retorno = this.http.get<any>(api.url.replace('[zipCode]', cep), httpOptions).pipe(catchError(this.handleError));
      if (!this.erroCep) {
        console.log("Endereço encontrado com sucesso!")
      }
      else {
        console.log("Continuar a buscar nas demais APIs...")
        let obj: any = Object.keys(baseApi);
        for (let i = 0; i < obj.length; i++) {
          let id = baseApi[obj[i]].Id;
          if (id != fonte) {
            api = baseApi.filter(function (x) { return x.Id === id })[0];
            this.erroCep = false;
            retorno = this.http.get<any>(api.url, httpOptions).pipe(catchError(this.handleError));
            if (!this.erroCep) {
              console.log("Endereço finalmente encontrado com sucesso!")
              break;
            }
          }
        }
      }
      return retorno;
    }
  }

  private getBaseApi(cep: string) {
    return [
      { Id: 1, url: `https://viacep.com.br/ws/${cep}/json/`, metodo: 'GET', cabecalho: this.cabec.NONE },
      { Id: 2, url: `http://republicavirtual.com.br/web_cep.php?formato=json&cep=${cep}`, metodo: 'GET', cabecalho: this.cabec.NONE },
      { Id: 3, url: `http://cep.la/${cep}`, metodo: 'GET', cabecalho: this.cabec.JSON }
    ]
  }

  private handleError(error: HttpErrorResponse) {
    this.erroCep = true;
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}