import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { PedidoComponent } from './Components/pedido/pedido.component';
import { VendedorComponent } from './Components/vendedor/vendedor.component';
import { ClientesComponent } from './Components/clientes/clientes.component';
import { VendedoresComponent } from './Components/vendedores/vendedores.component';
import { ListaPrecoComponent } from './Components/lista-preco/lista-preco.component';
import { NovoClienteComponent } from './Components/novo-cliente/novo-cliente.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'novo_pedido/:id', component: ListaPrecoComponent },
  { path: 'pedidos', component: PedidoComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'novo_cliente/:id', component: NovoClienteComponent },
  { path: 'vendedores', component: VendedoresComponent },
  { path: 'vendedor/:id', component: VendedorComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }