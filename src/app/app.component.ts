import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { ETheme } from '../app/Core/ENums/ETheme.enum';
import { VendedorDB } from './Core/Entities/VendedorDB';
import { LoginService } from './Core/Services/login.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'App-Vendas';
  icon = ETheme.ICON_MOON;
  textTheme = ETheme.TEXT_MOON;
  hideSideMenu = false;
  saudacao!: string | undefined;

  constructor(private responsive: BreakpointObserver,
    public loginService: LoginService,
    private router: Router) {
    loginService.obterNomeUsuario.subscribe(nome => this.mudarSaudacao(nome));
  }

  mudarSaudacao(nome: string) {
    this.saudacao = nome;
    if (nome !== undefined)
      this.saudacao = `Oi ${nome}!`;
  }

  async ngOnInit() {
    this.responsive.observe([
      Breakpoints.HandsetPortrait,
    ])
      .subscribe(result => {
        this.hideSideMenu = false;
        if (!result.matches)
          this.hideSideMenu = true;
      });
  }

  public toggle() {
    const theme = document.body.classList.toggle('dark-theme');
    if (theme) {
      this.textTheme = ETheme.TEXT_SUN;
      return (this.icon = ETheme.ICON_SUN);
    }
    this.textTheme = ETheme.TEXT_MOON;
    return (this.icon = ETheme.ICON_MOON);
  }

  menu(link: string): void {
    const vendedor = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
    if (vendedor)
      this.router.navigate([link]);
    else
      this.router.navigate(['login']);
  }
}