export interface ICadastroImpressao {
    Cadastro: string;
    Dados: any;
    Tabs: ICadastroTabImpressao[]
}

export interface ICadastroTabImpressao {
    NomeTab: string;
    DescricaoTab: string;
}