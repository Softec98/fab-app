import jsPDF from 'jspdf';
import "jspdf/dist/polyfills.es.js";
import html2canvas from 'html2canvas';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { SpinnerOverlayService } from '../../Core/Services/spinner-overlay.service';

@Component({
  selector: 'app-impressao-dialog',
  templateUrl: './impressao-dialog.component.html',
  styleUrls: ['./impressao-dialog.component.scss']
})
export class ImpressaoDialogComponent {

  @ViewChild('impressao') impressao!: ElementRef
  @ViewChild('tabGroup') tabGroup!: any;
  tabName: string = "pedido";

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private readonly spinner: SpinnerOverlayService) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabName = tabChangeEvent.tab.textLabel.toLowerCase().indexOf("pedido") > -1 ? "pedido" : "guia";
    console.log(this.tabName);
  }

  print(acao: string = 'print'): void {
    this.spinner.show();
    const data: any = document.getElementById(this.tabName);
    html2canvas(data).then((canvas: any) => {
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      heightLeft -= pageHeight;
      const doc = new jsPDF('p', 'mm');
      doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }
      this.spinner.hide();
      if (acao == 'download') {
        doc.save(`${this.tabName}-fab-${this.data.Id}.pdf`);
      }
      else {
        window.open(URL.createObjectURL(doc.output("blob")), '_blank');
      }
    });
  }
}