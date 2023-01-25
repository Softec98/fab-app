import { Router } from '@angular/router';
import { VendedorDB } from '../Entities/VendedorDB';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { DataService } from 'src/app/Infrastructure/Services/data.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  @Output() obterNomeUsuario: EventEmitter<any> = new EventEmitter();
  @Output() isAdmin: EventEmitter<any> = new EventEmitter();
  private NomeUsuario: string = '';
  private IsAdmin: boolean = false;
  private IdUsuario: number = 0;

  constructor(
    protected dataService: DataService,
    private router: Router) {
    this.dataService.cadastrarVendedoresSeNenhum();
    this.InicializarVendedor();
  }

  async login(login: string, senha: string): Promise<boolean> {
    const vendedor = await this.dataService.obterVendedorPelasCredenciais(login, senha);
    if (vendedor) {
      localStorage.setItem('usuario', JSON.stringify(vendedor));
      this.obterNomeUsuario.emit(vendedor.xContato.split(',')[0]);
      this.isAdmin.emit(vendedor.IsAdmin);
      this.InicializarVendedor();
      return true;
    } else {
      this.obterNomeUsuario.emit(undefined);
      return false;
    }
  }

  logout(): void {
    const vendedor = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
    if (vendedor) {
      if (confirm('Deseja realmente fazer logout?')) {
        localStorage.removeItem('usuario');
        alert(`Até logo, ${vendedor.xContato.split(',')[0]}!`);
        this.obterNomeUsuario.emit(undefined);
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

  private InicializarVendedor(): void {
    this.NomeUsuario = '';
    this.IsAdmin = false;
    this.IdUsuario = 0;
    const vendedor = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
    if (vendedor) {
      this.NomeUsuario = vendedor.xNome;
      this.IsAdmin = vendedor.IsAdmin;
      this.IdUsuario = vendedor.Id;
    }
  }
}