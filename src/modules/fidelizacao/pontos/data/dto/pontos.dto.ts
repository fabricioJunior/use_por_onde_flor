export class PontosHistoricoDto {
    criadoEm?: string;
    atualizadoEm?: string;
    id?: number;
    empresaId?: number;
    pessoaId?: number;
    pessoaDocumento?: string;
    tipo?: string;
    quantidade?: number;
    resgatado?: number;
    data?: string;
    observacao?: string;
    validaAte?: string;
    cancelada?: boolean;
    motivoCancelamento?: string;
    canceladaEm?: string;
    saldo?: number;
    valida?: boolean;
}

export class PontosDto {
    saldoPontos?: number;
    historico?: PontosHistoricoDto[];
}
