export class FaixaValorDB {

    public Id?: number;
    public Valor!: number;

    public constructor(init?: Partial<FaixaValorDB> ) {
        Object.assign(this, init);
    }
}