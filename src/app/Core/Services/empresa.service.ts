import { Buffer } from 'buffer/';
import { catchError, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';
import { SpinnerOverlayService } from './spinner-overlay.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor(private http: HttpClient,
    private readonly spinner: SpinnerOverlayService) { }

  erroEmpresa: boolean = false;

  obterEmpresa(_cnpj: string) {
    const tam = 14;
    let cnpj: string = _cnpj;
    if (cnpj.length < tam || !cnpj.match(/\d+/g)) {
      const mensagem = `Validação: O CNPJ deve conter ${tam} dígitos!`;
      alert(mensagem);
      return of({});
    }
    else {
      const apiKey = 'MzhlZGI0MTAtZThhYS00NDVkLThkMjAtM2QxZGYyNzk5YTNkLTE1ZjkyN2U0LTY4ZTYtNGM5Mi1hYmVmLTVlZjk3NzY2MWJjYQ==';
      const url = `https://api.cnpja.com/office/${cnpj}`;
      const httpOptions = {
        headers: new HttpHeaders({
          'authorization': Buffer.from(apiKey, 'base64').toString('binary') // depracated: atob(apiKey)  
        })
      };
      let retorno = this.http.get<any>(url, httpOptions).pipe(catchError(this.handleError));
      if (!this.erroEmpresa)
        console.log("Empresa encontrada com sucesso!")
      else
        console.log("Erro ao buscar a empresa!")

      return retorno;
    }
  }

  private handleError(error: HttpErrorResponse) {
    this.erroEmpresa = true;
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}