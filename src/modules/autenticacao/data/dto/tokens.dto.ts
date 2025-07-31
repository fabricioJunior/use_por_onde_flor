export class TokensDto {

    tokenDeAcesso?: string;
    tokenDeAtualizacao?: string;
    tipoDeToken?: string;
    expiracao?: Date;


    constructor(partial?: Partial<TokensDto>) {
        Object.assign(this, partial);
    }
}