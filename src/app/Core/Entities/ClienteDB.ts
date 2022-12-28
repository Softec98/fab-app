import { BaseEntity } from "./BaseEntity";

export class ClienteDB extends BaseEntity {
    public Id!: number;
    public xNome!: string;
    public xContato!: string;
    public xFantasia!: string;
    public tipPessoa!: string;
    public CNPJ!: string;
    public IE!: string;
    public xLgr!: string;
    public nro!: string;
    public xComplemento!: string;
    public cBairro!: string;
    public xMun!: string;
    public UF!: string;
    public cPais!: number;
    public xPais!: string;
    public CEP!: string;
    public fone!: string;
    public fone2!: string;
    public CRT!: number;
    public indME!: boolean;
    public email!: string;
    public SUFRAMA!: string;
    public indConsumidor!: boolean;
    public indInativo!: boolean;
    public IdPedidoUltimo!: number;
    public Id_Vendedor!: number;
    public constructor(init?: Partial<ClienteDB> ) {
        super(init as ClienteDB)
        Object.assign(this, init);
    }
}