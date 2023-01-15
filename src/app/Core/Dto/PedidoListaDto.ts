import { ProdutoDB } from "../Entities/ProdutoDB";
import { EmbalagemDB } from "../Entities/EmbalagemDB";
import { ProdutoPrecoDB } from "../Entities/ProdutoPrecoDB"
import { ProdutoFamiliaDB } from "../Entities/ProdutoFamiliaDB";
import { familiaJson, produtoJson, embalagemJson, precoJson } from "../../Infrastructure/ApplicationDB";

export class PedidoListaDto {
    public Id?: number;
    public cProd!: string;
    public Unid!: string;
    public xProd!: string;
    public Id_Produto_Familia!: number;
    public Id_Produto_Grupo!: number;
    public vVenda!: number;
    public qProd: number = 0;
    public Familia!: string;
    public Ordem!: number;
    public IsSomar!: boolean;
    public xEmbalagem!: string;
    public TotalItem!: number;
    public vPrecoMin!: number;

    public constructor(init?: Partial<ProdutoDB>) {
        Object.assign(this, init);
        const familia: ProdutoFamiliaDB[] = familiaJson;
        const prods: Partial<ProdutoDB>[] = produtoJson;
        const embs: Partial<EmbalagemDB>[] = embalagemJson;
        const precos: ProdutoPrecoDB[] = precoJson;
        const prod = prods.find(x => x.cProd == this.cProd)!;
        if (prod !== null && typeof prod !== 'undefined') {
            this.Id_Produto_Familia = prod.Id_Produto_Familia!;
            if (typeof this.Id_Produto_Familia !== null && typeof this.Id_Produto_Familia !== 'undefined') {
                const item = familia.find(x => x.Id == this.Id_Produto_Familia)!;
                if (item) {
                    this.Familia = item.xNome!;
                    this.Ordem = item.Ordem!;
                    this.IsSomar = item.Id_Embalagem > 0;
                    const emb = embs.find(x => x.Id == item.Id_Embalagem);
                    if (emb) {
                        this.xEmbalagem = emb.xEmbalagem!;
                    }
                }
            }
            if (typeof (this.vPrecoMin) == 'undefined' && precos.length > 0) {
                const preco = precos.find(x => x.Id_Cond_Pagto == 1 && (
                    x.cProd == this.cProd || x.Id_Produto_Familia == this.Id_Produto_Familia ||
                    x.Id_Produto_Grupo == this.Id_Produto_Grupo));
                if (preco !== null && typeof (preco) !== 'undefined' && typeof (preco?.vPrecoMin) !== 'undefined')
                    this.vPrecoMin = preco.vPrecoMin;
            }            
        }
    }
}