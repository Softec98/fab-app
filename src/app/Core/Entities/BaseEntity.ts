export abstract class BaseEntity {
    constructor(init?: BaseEntity) {
      Object.assign(this, init);
    }
    public IdUsuario!: number;
    public datCadastro!: Date;
    public datAlteracao!: Date;
}