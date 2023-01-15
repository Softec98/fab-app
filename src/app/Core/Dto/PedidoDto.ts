import { PedidoDB } from '../Entities/PedidoDB'
import { PedidoListaDto } from './PedidoListaDto';
import { db, fretes, status } from '../../Infrastructure/ApplicationDB';

export class PedidoDto extends PedidoDB {
  public NomeCliente!: string;
  public NomeFrete!: string;
  public NomeStatus!: string;
  public action!: string;
  public PedidosItensDto!: PedidoListaDto[];

  log() {
    console.log(JSON.stringify(this));
  }

  private count!: number;

  public constructor(init?: Partial<PedidoDB>, bOrdem: boolean = true) {
    super(init);
    this.NomeCliente = typeof (this.Id_Cliente) == 'undefined' ? "N/Consta" :
      db.clientes_Pedidos.find(x => x.key == this.Id_Cliente)?.value!;
    this.NomeFrete = typeof (this.Frete) == 'undefined' ? "N/Consta" :
      fretes.find(x => x.key == this.Frete)?.value!;
    this.NomeStatus = typeof (this.Id_Status) == 'undefined' ? "N/Consta" :
      status.find(x => x.key == this.Id_Status)?.value!;
    if (init?.PedidosItens?.length! > 0) {
      console.log(`Esse pedido tem ${init?.PedidosItens?.length!} itens.`);
      if (bOrdem) {
        this.PedidosItensDto = (init?.PedidosItens?.map(item => new PedidoListaDto(item))!)
          .sort((a, b) => (a.cProd < b.cProd) ? -1 : 1)
          .sort((a, b) => (a.Ordem < b.Ordem) ? -1 : 1);
      }
      else {
        this.PedidosItensDto = (init?.PedidosItens?.map(item => new PedidoListaDto(item))!);
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