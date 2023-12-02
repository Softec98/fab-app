import jsPDF from 'jspdf';
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
  tabName: string = this.data.Tabs[0].NomeTab;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly spinner: SpinnerOverlayService
  ) { }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabName = this.data.Tabs[tabChangeEvent.index].NomeTab;
    console.log(this.tabName);
  }

  print(id: number = 0, acao: string = 'print'): void {
    this.spinner.show();
    const data: any = document.getElementById(this.tabName);
    html2canvas(data).then((canvas: any) => {
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      heightLeft -= pageHeight;
      const doc = new jsPDF('p', 'mm', 'a4');
      var FILEURI = canvas.toDataURL('image/png');
      doc.addImage(FILEURI, 'PNG', 0, position, imgWidth, imgHeight); //, '', 'MEDIUM');
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(FILEURI, 'PNG', 0, position, imgWidth, imgHeight) //, '', 'MEDIUM');
        heightLeft -= pageHeight;
      }
      this.spinner.hide();
      if (acao == 'download') {
        if (id == 0)
          doc.save(`${this.tabName}-fab.pdf`);
        else
          doc.save(`${this.tabName}-fab-${id}.pdf`);
      }
      else
        window.open(window.URL.createObjectURL(doc.output("blob")), '_blank');
    });
  }

  downloadCSV() {
    const data: string = this.data.Dados.datEmissao.toLocaleDateString();
    const pedido = this.data.Dados.Id;
    let texto = "Pedido;Cliente;Empresa;Data de emissão;observações;item;Código do produto;Descrição do produto;Tipo de produto;Método de ressuprimento;U.M.;Qtde;Preço unitário;Data de entrega\n\n";
    let index = 1;
    this.data.Dados.PedidosItensDto.forEach(function (item: any) {
      let indice = index.toString().padStart(3, '0');
      let preco = item.vProd.toString().replace('.', ',');
      texto += `PI ${pedido};FAB CONF;FAB IND;${data};cnpj 28.644.999/0003-92;${indice};${item?.cProd};${item?.xProd};Produto Acabado;Como padrÃ£o fabricado;Caixa;${item?.qProd};${preco};${data}\n\n`;
      index++;
    });
    const blob = new Blob([texto], { type: 'text/csv' });
    this.forcarDownload(window.URL.createObjectURL(blob), `pedido-fab-${pedido}.csv`)
  }

  private forcarDownload(blob: any, filename: string) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}