import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { UsuarioDto } from 'src/app/Core/Dto/UsuarioDto';
import { environment } from 'src/environments/environment';
import { PlanilhaDto } from 'src/app/Core/Dto/PlanilhaDto';
import { LoginService } from 'src/app/Core/Services/login.service';
import { IBarraProgresso } from 'src/app/Core/Interfaces/IBarraProgresso';
import { DataService } from 'src/app/Infrastructure/Services/data.service';
import { GoogleApiService } from 'src/app/Core/Services/google.api.service';
import { SpinnerOverlayService } from 'src/app/Core/Services/spinner-overlay.service';
import { BarraProgressoService } from 'src/app/Core/Services/barra.progresso.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  barraProgresso!: IBarraProgresso;
  //  = 
  //   { 
  //     label_ini: 'Carregando...', 
  //     label_fim: '', 
  //     count: 0, 
  //     progress: 1, 
  //     increment: 0, 
  //     show: true 
  //   } as IBarraProgresso;
  erro: boolean = false;
  constructor(
    public loginService: LoginService,
    protected dataService: DataService,
    protected googleApiService: GoogleApiService,
    private readonly spinner: SpinnerOverlayService,
    private barraProgressoService: BarraProgressoService,
    private router: Router) {
      if (environment.pathDB.toLowerCase() == "local")
        this.dataService.cadastrarVendedoresSeNenhum();
    }

    async login(login: string, senha: string) {
        let usuario: UsuarioDto | undefined;
        if (environment.pathDB.toLowerCase() == "local") {
          await this.dataService.obterVendedorPelasCredenciais(login, senha).then(data =>
            usuario = new UsuarioDto(data)
          );
        }
        else {
          this.spinner.show();
          //this.barraProgresso.show = true;
          usuario = (await <any>this.googleApiService.obterTokenApi(login, senha)).objetoRetorno as UsuarioDto;
          if (usuario) {
              let incremento: number;
              let progresso: number;
              let planilhaArray: PlanilhaDto[] = [];
              this.googleApiService.obterApi('Planilha').then(
                  (planilha: any) => {
                      if (planilha && planilha.isOk) {
                        planilhaArray = planilha.objetoRetorno as PlanilhaDto[];
                        this.googleApiService.planilhas = planilhaArray;
                        planilhaArray = planilhaArray.filter(x => x.Atualiza == true);
                        incremento = 100 / (planilhaArray.length + 1);
                        progresso = incremento;
                        // this.barraProgresso.increment = incremento;
                        // this.barraProgresso.progress = incremento;
                        // this.barraProgressoService.updateProgress(progresso);
                        let isGravar: boolean = false;
                        planilhaArray.forEach(async x => {
                            let planilha = new PlanilhaDto(x);
                            const lsPlanilha = localStorage.getItem(planilha.Tabela)!;
                            if (lsPlanilha != null && lsPlanilha != 'undefined') {
                                var lsTabela = new PlanilhaDto(JSON.parse(lsPlanilha!));
                                if (planilha.Ultima_Edicao > lsTabela.Ultima_Edicao) {
                                    isGravar = true;
                                }
                            }
                            else {
                              isGravar = true; }
                            if (isGravar) {
                              this.googleApiService.obterApi(planilha.Tabela.replace("Sales_", "")).then(
                                (retorno: any) => {
                                    if (retorno && retorno.isOk) {
                                      planilha.isOk = true;
                                      planilha.objetoRetorno = retorno.objetoRetorno;
                                      localStorage.setItem(planilha.Tabela, JSON.stringify(planilha!));
                                      isGravar = false;
                                    }
                                  });
                            }
                            progresso += incremento;
                            // this.barraProgresso.progress = progresso;
                            // this.barraProgresso.label_ini = `Carregando ${planilha.Tabela.replace("Sales_", "")} ...`;
                            // this.barraProgressoService.updateProgress(progresso);
                            if (progresso > 99) {
                              this.spinner.hide();
                              this.router.navigate(['/home']);
                            }
                          },
                        );                        
                      }
                    });              
          }
        }
        if (usuario) {
          localStorage.setItem('usuario', JSON.stringify(usuario));
          this.loginService.InicializarVendedor();
          //this.barraProgresso.show = false;
          this.spinner.hide();
          this.router.navigate(['/home']);
        } else {
          this.loginService.InicializarVendedor();
          this.barraProgresso.show = false;
          this.spinner.hide();
          alert('Desculpe, credencial inválida! Por favor, tente novamente.'); 
        }
    }
}