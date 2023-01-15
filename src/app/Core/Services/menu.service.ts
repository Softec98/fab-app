import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { VendedorDB } from '../Entities/VendedorDB';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private router: Router) { }

  menu(link: string): void {
    const vendedor = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
    if (vendedor) { this.router.navigate([link]); }
    else { this.router.navigate(['login']); }
  }

  isAdmin(): boolean {
    const vendedor = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
    if (vendedor && vendedor.IsAdmin) { return true; }
    return false;
  }
}