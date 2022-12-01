export class ProdutoPrecoDB {
    public Id?: number;
    public Id_Cond_Pagto!: number; 
    public cProd!: string;
    public Id_Produto_Familia!: number;
    public Id_Produto_Grupo!: number;
    public vPreco!: number;

    public constructor(init?: Partial<ProdutoPrecoDB> ) {
        Object.assign(this, init);
    }
}