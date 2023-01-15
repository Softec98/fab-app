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

  constructor(protected dataService: DataService, private router: Router) { }

  async login(login: string, senha: string): Promise<boolean> {
    this.dataService.cadastrarVendedoresSeNenhum();
    const vendedor = await this.dataService.obterVendedorPelasCredenciais(login, senha);
    if (vendedor) {
      localStorage.setItem('usuario', JSON.stringify(vendedor));
      this.obterNomeUsuario.emit(vendedor.xContato.split(',')[0]);
      this.isAdmin.emit(vendedor.IsAdmin);
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
}