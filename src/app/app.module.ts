import { MaterialModule } from './material.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './Components/home/home.component';
import { PedidoComponent } from './Components/pedido/pedido.component';
import { ClienteComponent } from './Components/cliente/cliente.component';
import { ClientesComponent } from './Components/clientes/clientes.component';
import { ListaPrecoComponent } from './Components/lista-preco/lista-preco.component';
import { NovoClienteComponent } from './Components/novo-cliente/novo-cliente.component';
import { SpinnerOverlayComponent } from './Components/spinner-overlay/spinner-overlay.component';
import { ImpressaoDialogComponent } from './Components/impressao-dialog/impressao-dialog.component';
import { PedidoImpressaoComponent } from './Components/pedido-impressao/pedido-impressao.component';

import { MaskCepDirective } from './Infrastructure/Directives/mask-cep.directive';
import { MaskDateDirective } from './Infrastructure/Directives/mask-date.directive';

import { CpfPipe } from './Infrastructure/Pipes/cpf.pipe';
import { CnpjPipe } from './Infrastructure/Pipes/cnpj.pipe';
import { FonePipe } from './Infrastructure/Pipes/fone.pipe';

import ptBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { CepPipe } from './Infrastructure/Pipes/cep.pipe';
import { ZeroEsquerdaPipe } from './Infrastructure/Pipes/zero-esquerda.pipe';
registerLocaleData(ptBr);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PedidoComponent,
    ClienteComponent,
    ClientesComponent,
    ListaPrecoComponent,
    NovoClienteComponent,
    SpinnerOverlayComponent,
    ImpressaoDialogComponent,
    PedidoImpressaoComponent,
    MaskCepDirective,
    MaskDateDirective,
    CepPipe,
    CpfPipe,
    CnpjPipe,
    FonePipe,
    ZeroEsquerdaPipe
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }