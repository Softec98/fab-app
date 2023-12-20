export class PlanilhaDto {
    public Id!: number;
    public Tabela!: string;
    public Nome!: string;
    public Id_Planilha!: number;
    public Atualiza!: boolean;
    public Usuario!: string;
    public Ultima_Edicao!: number;
    public isOk!: boolean;
    public objetoRetorno!: any; 
    public constructor(init?: Partial<PlanilhaDto> ) {
        Object.assign(this, init);
        if (init)
            this.ajustarNomesPropriedades(init);
    }

    private ajustarNomesPropriedades(init: any) {
        if (init['Última edição'] !== undefined) {
          this.Ultima_Edicao = init['Última edição'];
          delete init['Última edição'];
        }
        if (init['Usuário'] !== undefined) {
          this.Usuario = init['Usuário'];
          delete init['Usuário'];
        }
    }    
}