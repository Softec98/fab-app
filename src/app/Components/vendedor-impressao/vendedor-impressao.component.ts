import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-vendedor-impressao',
  templateUrl: './vendedor-impressao.component.html',
  styleUrls: ['./vendedor-impressao.component.scss']
})
export class VendedorImpressaoComponent {
  @ViewChild('frente')
  frente!: ElementRef;
  qtdLinPg1: number = 48;
  qtdLinPgN: number = 48;
  paginas: number = 0;
  hoje: Date = new Date();

  constructor(public dialogRef: MatDialogRef<VendedorImpressaoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.paginas = Math.ceil((this.data.Dados.length - this.qtdLinPg1) / this.qtdLinPgN);
  }
}