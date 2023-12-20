import { VendedorDB } from "../Entities/VendedorDB";

export class UsuarioDto {
    public Id!: number;
    public Codigo!: number;
    public xNome!: string;
    public xContato!: string;
    public email!: string;
    public ManterConectado!: boolean;
    public UltimoAcesso!: Date;
    public IsAdmin!: boolean;
    public IdPai!: number;
    public Token!: string;

    public constructor(init?: Partial<VendedorDB> ) {
        Object.assign(this, init);
    }
}