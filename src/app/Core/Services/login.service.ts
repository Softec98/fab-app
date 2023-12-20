import { Router } from '@angular/router';
import { UsuarioDto } from '../Dto/UsuarioDto';
import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  @Output() obterNomeUsuario: EventEmitter<any> = new EventEmitter();
  @Output() isAdmin: EventEmitter<any> = new EventEmitter();
  @Output() BarraProgresso: EventEmitter<any> = new EventEmitter();
  @Output() TabelaBarProgr: EventEmitter<any> = new EventEmitter();  
  private NomeUsuario: string = '';
  private IsAdmin: boolean = false;
  private IdUsuario: number = 0;
  private IdUsuarioPai: number = 0;

  constructor(
    private router: Router) { }

  logout(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario')!) as UsuarioDto;
    if (usuario) {
      if (confirm('Deseja realmente fazer logout?')) {
        localStorage.removeItem('usuario');
        this.InicializarVendedor();
        alert(`Até logo, ${usuario.xContato.split(',')[0]}!`);
        this.router.navigate(['login']);
      }
    }
  }

  ObterNomeUsuario(): string {
    return this.NomeUsuario;
  }

  IsAdministrador(): boolean {
    return this.IsAdmin;
  }

  ObterIdUsuario(): number {
    return this.IdUsuario;
  }

  ObterIdUsuarioPai(): number {
    return this.IdUsuarioPai > 0 ? this.IdUsuarioPai : this.IdUsuario;
  }

  public InicializarVendedor(): void {
    this.NomeUsuario = '';
    this.IsAdmin = false;
    this.IdUsuario = 0;
    this.IdUsuarioPai = 0;
    const usuario = JSON.parse(localStorage.getItem('usuario')!) as UsuarioDto;
    if (usuario) {
      this.NomeUsuario = usuario.xNome;
      this.IsAdmin =  Boolean(usuario.IsAdmin);
      this.IdUsuario = usuario.Id;
      this.IdUsuarioPai = usuario.IdPai ?? 0;
    }
    this.obterNomeUsuario.emit(usuario?.xContato?.split(',')[0]!);
    this.isAdmin.emit(usuario?.IsAdmin!);
  }
}