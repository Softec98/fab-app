import { Component } from '@angular/core';
import { UsuarioDto } from './Core/Dto/UsuarioDto';
import { ETheme } from '../app/Core/ENums/ETheme.enum';
import { MenuService } from './Core/Services/menu.service';
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
  isAdmin!: boolean | undefined;

  constructor(private responsive: BreakpointObserver,
    public loginService: LoginService,
    private menuService: MenuService) {
    loginService.obterNomeUsuario.subscribe(nome => this.mudarSaudacao(nome));
    loginService.isAdmin.subscribe(isAdmin => this.isAdmin = isAdmin); // this.mudarAdmin(isAdmin)
  }

  mudarSaudacao(nome: string) {
    this.saudacao = nome;
    if (nome !== undefined)
      this.saudacao = `Oi ${nome}!`;
  }

  // mudarAdmin(isAdmin: boolean) {
  //   this.isAdmin = isAdmin;
  // }

  async ngOnInit() {
    this.responsive.observe([
      Breakpoints.HandsetPortrait,
    ])
      .subscribe(result => {
        this.hideSideMenu = false;
        if (!result.matches)
          this.hideSideMenu = true;
      });
    const usuario = JSON.parse(localStorage.getItem('usuario')!) as UsuarioDto;
    if (usuario) {
      this.saudacao = `Oi ${usuario.xContato.split(',')[0]}!`;
      this.isAdmin = usuario.IsAdmin;
    }
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
    this.menuService.menu(link);
  }
}