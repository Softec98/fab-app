import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LogService } from '../../Core/Services/log.service';
import { VendedorDB } from 'src/app/Core/Entities/VendedorDB';
import { DataService } from '../../Infrastructure/Services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  autenticado: boolean = false;

  constructor(private dataService: DataService, private router: Router) { }

  async ngOnInit(): Promise<void> {
    const cfop = await this.dataService.obterCFOP();
    if (LogService.produtosSemListaDePreco.length > 0) {
      const mensagem: string = LogService.produtosSemListaDePreco.map(x => x.toString()).join("\n");
      alert('Produtos sem lista de preço:\n\n' + mensagem);
    }
  }

  menu(link: string): void {
    const vendedor = JSON.parse(localStorage.getItem('usuario')!) as VendedorDB;
    if (vendedor)
      this.router.navigate([link]);
    else
      this.router.navigate(['login']);
  }
}