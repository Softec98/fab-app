import { BaseEntity } from "./BaseEntity";

export class VendedorDB extends BaseEntity {
    public Id!: number;
    public Codigo!: number;
    public xNome!: string;
    public xContato!: string;
    public fone!: string;
    public fone2!: string;
    public Celular!: string;
    public Email!: string;
    public Documento!: string;
    public Login!: string;
    public Acesso!: string;
    public IdRegiao!: number;
    public DataNasc!: Date;
    public ManterConectado!: boolean;
    public UltimoAcesso!: Date;
    public IsAdmin!: boolean;
    public IdPai!: number;

    public constructor(init?: Partial<VendedorDB> ) {
        super(init as VendedorDB)
        Object.assign(this, init);
    }
}