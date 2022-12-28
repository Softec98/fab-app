export class RegiaoDB {

    public Id?: number;
    public xNome!: string;

    public constructor(init?: Partial<RegiaoDB> ) {
        Object.assign(this, init);
    }
}