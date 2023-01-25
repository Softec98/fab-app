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
import { GuiaExpedicaoComponent } from './Components/guia-expedicao/guia-expedicao.component';
import { GuiaExpedicaoRodapeComponent } from './Components/guia-expedicao-rodape/guia-expedicao-rodape.component';
import { LoginComponent } from './Components/login/login.component';
import { PedidoImpressaoRodapeComponent } from './Components/pedido-impressao-rodape/pedido-impressao-rodape.component';
import { VendedoresComponent } from './Components/vendedores/vendedores.component';
import { VendedorImpressaoComponent } from './Components/vendedor-impressao/vendedor-impressao.component';
import { VendedorComponent } from './Components/vendedor/vendedor.component';
import { DatePickerComponent } from './Components/date-picker/date-picker.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

registerLocaleData(ptBr);

export const MY_FORMATS = {
  parse: {
    dateInput: 'yyyy-MM-DD'
  },
  display: {
    dateInput: 'yyyy-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

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
    ZeroEsquerdaPipe,
    GuiaExpedicaoComponent,
    GuiaExpedicaoRodapeComponent,
    LoginComponent,
    PedidoImpressaoRodapeComponent,
    VendedoresComponent,
    VendedorImpressaoComponent,
    VendedorComponent,
    DatePickerComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    AppRoutingModule
  ],

  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'always' } },    
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },    
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }