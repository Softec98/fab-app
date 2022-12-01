import { EFrete } from "../ENums/EFrete.enum";

export class CondPagtoDB {

    public Id?: number;
    public xNome!: string;
    public Frete!: EFrete;
    public pEncargo!:number;
    public Dias01!:number;
    public Dias02!:number;
    public Dias03!:number;
    public Dias04!:number;
    public Dias05!:number;
    public Dias06!:number;

    public constructor(init?: Partial<CondPagtoDB> ) {
        Object.assign(this, init);
    }
}