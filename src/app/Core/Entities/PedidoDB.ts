import { BaseEntity } from "./BaseEntity";
import { PedidoItemDB } from './PedidoItemDB'
import { EFrete } from "../ENums/EFrete.enum"
import { db } from '../../Infrastructure/ApplicationDB'

export class PedidoDB extends BaseEntity {
    public Id!: number;
    public datEmissao!: Date;
    public Referencia!: string;
    public Codigo!: string;
    public Transacao!: number;
    public Id_Cliente!: number;
    public Id_Status!: number;
    public Id_Cond_Pagto!: number;
    public Id_Pagto_Tipo!: number;
    public Id_Pagto_Codigo!: number;
    public Frete!: EFrete;
    public valTotal: number = 0;
    public valDesconto: number = 0;
    public valFrete: number = 0;
    public valTaxas: number = 0;
    public valLiquido: number = 0;
    public Parcelas!: number;
    public Itens!: number;
    public TipoOperacao!: string;
    public datCredito!: Date;
    public bICMS!: number;
    public vICMS: number = 0;
    public bIPI!: number;
    public vIPI: number = 0;
    public bST!: number;
    public vST!: number;
    public vMerc: number = 0;
    public vTotalNF: number = 0;
    public TrackNumber!: string;
    public datEnvio!: Date;
    public obs!: string;
    public PedidosItens!: PedidoItemDB[];
    public Id_Vendedor!: number;

    public constructor(init?: Partial<PedidoDB>) {
        super(init as PedidoDB)
        Object.assign(this, init);
    }

    async Salvar(): Promise<number> {
        await db.transaction('rw', db.Pedidos, db.PedidosItens, async () => {
            db.Pedidos.put(new PedidoDB(this))
                .then(Id => {
                    this.Id = Id;
                    this.PedidosItens.map(item => {
                        item.Id_Pedido = Id;
                        db.PedidosItens.put(new PedidoItemDB(item));
                    });
                    return Id;
                });
        });
        return this.Id;
    }

    Totalizar() {
        if (typeof (this.PedidosItens) != 'undefined') {
            this.vMerc = this.PedidosItens.reduce<number>((soma, item) => { return soma + item.qProd * item.vProd; }, 0);
            this.valLiquido = this.vMerc + this.vICMS + this.vIPI;
            this.valTotal = this.valLiquido + this.valFrete + this.valTaxas - this.valDesconto;
        }
    }
}