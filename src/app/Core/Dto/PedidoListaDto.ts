import { ProdutoDB } from "../Entities/ProdutoDB";
import { EmbalagemDB } from "../Entities/EmbalagemDB";
import { ProdutoPrecoDB } from "../Entities/ProdutoPrecoDB"
import { ProdutoFamiliaDB } from "../Entities/ProdutoFamiliaDB";

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

    public constructor(init?: Partial<ProdutoDB>, 
        familia?: ProdutoFamiliaDB[],
        embs?: Partial<EmbalagemDB>[],
        precos?: Partial<ProdutoPrecoDB>[]) {
        Object.assign(this, init);
        if (init !== null && typeof init !== 'undefined') {
            this.Id_Produto_Familia = init.Id_Produto_Familia!;
            if (typeof this.Id_Produto_Familia !== null && typeof this.Id_Produto_Familia !== 'undefined') {
                const item = familia?.find(x => x.Id == this.Id_Produto_Familia)!;
                if (item) {
                    this.Familia = item.xNome!;
                    this.Ordem = item.Ordem!;
                    this.IsSomar = item.Id_Embalagem > 0;
                    const emb = embs?.find(x => x.Id == item.Id_Embalagem);
                    if (emb) {
                        this.xEmbalagem = emb.xEmbalagem!;
                    }
                }
            }
            if (typeof (this.vPrecoMin) == 'undefined' && init !== undefined) {
                const preco = precos?.find(x => x.Id_Cond_Pagto == 1 && (
                    x.cProd == this.cProd || x.Id_Produto_Familia == this.Id_Produto_Familia ||
                    x.Id_Produto_Grupo == this.Id_Produto_Grupo));
                if (preco !== null && typeof (preco) !== 'undefined' && typeof (preco?.vPrecoMin) !== 'undefined')
                    this.vPrecoMin = preco.vPrecoMin;
            }            
        }
    }
}