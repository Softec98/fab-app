import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { PedidoComponent } from './Components/pedido/pedido.component';
import { ClientesComponent } from './Components/clientes/clientes.component';
import { ListaPrecoComponent } from './Components/lista-preco/lista-preco.component';
import { NovoClienteComponent } from './Components/novo-cliente/novo-cliente.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'novo_pedido/:id', component: ListaPrecoComponent },
  { path: 'pedidos', component: PedidoComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'novo_cliente/:id', component: NovoClienteComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }