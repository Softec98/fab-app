export class PedidoItemDB  {

    public Id!: number;
    public Id_Pedido!: number;
    public Id_Produto!: number;
    public cProd!: string;
    public Unid!: string;
    public xProd!: string;
    public NCM!: string;
    public EXTIPI!: string;
    public CFOP!: number;
    public qProd!: number;
    public vProd!: number;
    public vMerc!: number;
    public pIPI!: number;
    public vIPI!: number;    
    public pICMS!: number;
    public rICMS!: number;
    public bICMS!: number;
    public vICMS!: number;    
    public bST!: number;
    public pIVA!: number;
    public pICMSST!: number;
    public vST!: number;
    public vFrete!: number;
    public vDesconto!: number;
    public vDespesas!: number;
    public vTotal!: number;
    public vLiquido!: number;
    public numPedCli!: string;
    public numPedCliItem!: number;

    public constructor(init?: Partial<PedidoItemDB> ) {
        Object.assign(this, init);
    }
}