export class NCMDB  {

    public Id?: number;
    public NCM!: string;
    public EXTIPI!: string;
    public pIPI!: number;
    public vIPI!: number;
    public cIPI!: string;

    public constructor(init?: Partial<NCMDB> ) {
        Object.assign(this, init);
    }
}