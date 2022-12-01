import { ProdutoDB } from "../Entities/ProdutoDB";
import { ProdutoFamiliaDB } from "../Entities/ProdutoFamiliaDB";
import { familiaJson } from "../../Infrastructure/ApplicationDB";

export class ProdutoListaDto {
    public Id?: number;
    public cProd!: string;
    public Unid!: string;
    public xProd!: string;
    public Id_Produto_Familia!: number;
    public vVenda!: number;
    public qProd: number = 0;
    public Familia!: string;

    public constructor(init?: Partial<ProdutoDB>) {
        Object.assign(this, init);
        
        const familia: ProdutoFamiliaDB[] = familiaJson;

        if (typeof(this.Id_Produto_Familia) !== 'undefined') {
            this.Familia = familia.find(x => x.Id == this.Id_Produto_Familia)!.xNome!;
        }
    }
}