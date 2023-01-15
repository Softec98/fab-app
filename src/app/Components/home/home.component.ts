import { Component, OnInit } from '@angular/core';
import { LogService } from '../../Core/Services/log.service';
import { MenuService } from 'src/app/Core/Services/menu.service';
import { DataService } from '../../Infrastructure/Services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  autenticado: boolean = false;

  constructor(private dataService: DataService, private menuService: MenuService) { }

  async ngOnInit(): Promise<void> {
    const cfop = await this.dataService.obterCFOP();
    if (LogService.produtosSemListaDePreco.length > 0) {
      const mensagem: string = LogService.produtosSemListaDePreco.map(x => x.toString()).join("\n");
      alert('Produtos sem lista de preço:\n\n' + mensagem);
    }
  }

  menu(link: string): void {
    this.menuService.menu(link);
  }
}