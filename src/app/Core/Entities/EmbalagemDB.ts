export class EmbalagemDB {

    public Id?: number;
    public xEmbalagem!: string;
    public cEmbalagem!: string;
    public pEmbalagem!: number;
    public Peso!: number;

    public constructor(init?: Partial<EmbalagemDB> ) {
        Object.assign(this, init);
    }
}