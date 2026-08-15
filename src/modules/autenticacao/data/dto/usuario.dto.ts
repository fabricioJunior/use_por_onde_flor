export class UsuarioDto {

    nome?: string;
    sobrenome?: string;
    email?: string;
    senha?: string;
    documento?: string;
    dataNascimento?: string;
    telefone?: string;
    empresaId?: number
    id?: number;
    emailVerificado?: boolean;

    constructor(partial?: Partial<UsuarioDto>) {
        Object.assign(this, partial);
    }

}