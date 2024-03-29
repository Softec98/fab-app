import { PedidoDB } from '../Entities/PedidoDB'
import { PedidoListaDto } from './PedidoListaDto';
import { IAuxiliar } from '../Interfaces/IAuxiliar';
import { EmbalagemDB } from '../Entities/EmbalagemDB';
import { IVendedor_aux } from '../Interfaces/IVendedor_aux';
import { ProdutoPrecoDB } from '../Entities/ProdutoPrecoDB';
import { ProdutoGrupoDB } from '../Entities/ProdutoGrupoDB';
import { ProdutoFamiliaDB } from '../Entities/ProdutoFamiliaDB';

export class PedidoDto extends PedidoDB {
  public NomeCliente!: string;
  public NomeVendedor!: string;
  public NomeFrete!: string;
  public NomeStatus!: string;
  public action!: string;
  public PedidosItensDto!: PedidoListaDto[];

  log() {
    console.log(JSON.stringify(this));
  }

  private count!: number;

  public constructor(init?: Partial<PedidoDB>, 
    clientes?: IAuxiliar[], 
    vendedores?: IVendedor_aux[], 
    fretes?: IAuxiliar[], 
    status?: IAuxiliar[],
    familia?: ProdutoFamiliaDB[],
    grupo?: ProdutoGrupoDB[],
    embalagem?: EmbalagemDB[],
    preco?: ProdutoPrecoDB[], 
    bOrdem: boolean = true) {
    super(init);
    this.NomeCliente = typeof (this.Id_Cliente) == 'undefined' ? "N/Consta" :
      clientes?.find(x => x.key == this.Id_Cliente)?.value!;
    this.NomeVendedor = typeof (this.Id_Vendedor) == 'undefined' ? "N/Consta" :
      vendedores?.find(x => x.key == this.Id_Vendedor)?.value!;
    this.NomeFrete = typeof (this.Frete) == 'undefined' ? "N/Consta" :
      fretes?.find(x => x.key == this.Frete)?.value!;
    this.NomeStatus = typeof (this.Id_Status) == 'undefined' ? "N/Consta" :
      status?.find(x => x.key == this.Id_Status)?.value!;
    if (init?.PedidosItens?.length! > 0) {
      console.log(`Esse pedido tem ${init?.PedidosItens?.length!} itens.`);
      if (bOrdem) {
        this.PedidosItensDto = (init?.PedidosItens?.map(item => 
          new PedidoListaDto(
            item,
            familia, 
            embalagem, 
            preco))!)
          .sort((a, b) => (a.cProd < b.cProd) ? -1 : 1)
          .sort((a, b) => (a.Ordem < b.Ordem) ? -1 : 1);
      }
      else {
        this.PedidosItensDto = (init?.PedidosItens?.map(item => 
          new PedidoListaDto(
            item,
            familia, 
            embalagem, 
            preco))!);
      }
      this.PedidosItens.length = 0;
      this.PedidosItensDto.forEach((item, index) => {
        if (index == 0 || item.Familia !== this.PedidosItensDto[index - 1].Familia) {
          this.count = 0
        }
        this.count += 1;
        item.TotalItem = this.count;
      });
    }
  }
}