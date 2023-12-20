import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { IBarraProgresso } from 'src/app/Core/Interfaces/IBarraProgresso';
import { BarraProgressoService } from 'src/app/Core/Services/barra.progresso.service';

@Component({
  selector: 'app-barra-progresso',
  templateUrl: './barra-progresso.component.html',
  styleUrls: ['./barra-progresso.component.scss']
})
export class BarraProgressoComponent implements OnInit {

  progress: number = 0;
  barraProgresso!: IBarraProgresso; 
  private progressSubscription: Subscription = new Subscription();

  constructor(private barraProgressoService: BarraProgressoService) { }

  ngOnInit() {
    this.progressSubscription = this.barraProgressoService.getProgress().subscribe((progress: number) => {
      if (progress) {
        //progress.show = true;
        //this.barraProgresso = progress;
        this.progress = progress;
      }
    });
  }
}