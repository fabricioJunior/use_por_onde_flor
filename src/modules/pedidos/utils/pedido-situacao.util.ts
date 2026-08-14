// Labels pt-BR pros enums crus que vêm do apollo-api (SituacaoPedido/SituacaoEntregaPedido) --
// front nunca deve exibir o valor snake_case direto (ex: "em_andamento").
const SITUACAO_LABELS: Record<string, string> = {
    em_andamento: 'Em andamento',
    conferido: 'Conferido',
    faturado: 'Faturado',
    encerrado: 'Encerrado',
    cancelado: 'Cancelado',
};

const SITUACAO_ENTREGA_LABELS: Record<string, string> = {
    nao_aplicavel: '',
    aguardando_chamada: 'Aguardando chamada',
    embalado: 'Embalado',
    chamado: 'Chamado',
    entregue: 'Entregue',
};

export function situacaoPedidoLabel(situacao?: string): string {
    if (!situacao) {
        return '';
    }
    return SITUACAO_LABELS[situacao] ?? situacao;
}

export function situacaoEntregaLabel(situacaoEntrega?: string): string {
    if (!situacaoEntrega) {
        return '';
    }
    return SITUACAO_ENTREGA_LABELS[situacaoEntrega] ?? situacaoEntrega;
}

// "Entregue" cobre tanto entrega por transportadora (situacaoEntrega='entregue') quanto retirada em
// loja confirmada (retiradoEm preenchido) -- os dois fluxos terminam em "cliente já está com o produto".
export function pedidoFoiEntregue(situacaoEntrega?: string, retiradoEm?: string): boolean {
    return situacaoEntrega === 'entregue' || !!retiradoEm;
}
