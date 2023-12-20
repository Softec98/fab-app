import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IBarraProgresso } from '../Interfaces/IBarraProgresso';

@Injectable({
  providedIn: 'root'
})
export class BarraProgressoService {
  private progressSubject = new Subject<number>();
  
  constructor() { }

  getProgress() {
    return this.progressSubject.asObservable();
  }

  updateProgress(progress: number) {
    this.progressSubject.next(progress);
  }
}