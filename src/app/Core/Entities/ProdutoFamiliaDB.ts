export class ProdutoFamiliaDB {

    public Id?: number;
    public xNome!: string;
    public Id_Embalagem!: number;

    public constructor(init?: Partial<ProdutoFamiliaDB> ) {
        Object.assign(this, init);
    }
}