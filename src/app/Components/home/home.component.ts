import { Component, OnInit } from '@angular/core';
import { LogService } from '../../Core/Services/log.service';
import { DataService } from '../../Infrastructure/Services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private dataService: DataService) { }

  async ngOnInit(): Promise<void> {
    const cfop = await this.dataService.obterCFOP();
    if (LogService.produtosSemListaDePreco.length > 0) {
      const mensagem: string = LogService.produtosSemListaDePreco.map(x => x.toString()).join("\n");
      alert('Produtos sem lista de preço:\n\n' + mensagem);
    }
  }
}