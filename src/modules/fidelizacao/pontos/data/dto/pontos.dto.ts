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

export function calcularSaldoPontos(historico?: PontosHistoricoDto[]): number {
    if (!historico?.length) {
        return 0;
    }

    return historico.reduce((saldo, ponto) => {
        if (ponto.cancelada) {
            return saldo;
        }

        const tipo = ponto.tipo?.trim().toLowerCase();
        const quantidade = Math.abs(ponto.quantidade ?? 0);

        if (tipo === 'crédito') {
            return saldo + quantidade;
        }

        if (tipo === 'débito') {
            return saldo - quantidade;
        }

        return saldo;
    }, 0);
}
