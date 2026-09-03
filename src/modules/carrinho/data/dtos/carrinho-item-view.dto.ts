// View unificada usada pela UI (carrinho page / badge do header), venha da API (`CarrinhoDataSource`,
// autenticado) ou do storage local (`CarrinhoStorageService`, convidado) enriquecido em runtime via
// `GET /e-commerce/{id}/produtos/{produtoId}` (`CarrinhoFacadeService.enriquecerItensLocais`).
export interface CarrinhoItemViewDto {
    produtoId?: number;
    referenciaId?: number;
    quantidade?: number;
    nome?: string;
    corNome?: string;
    tamanhoNome?: string;
    // Opcional, mesma ressalva de EcommerceReferenciaProdutoDto.estampaNome -- backend ainda não
    // preenche em CarrinhoItemResponse.
    estampaNome?: string;
    valor?: number;
    valorPromocional?: number;
    // Regras/condições de troca da promoção que gerou `valorPromocional`, quando ela tiver
    // (ver PromocaoPrecoService.promocaoAplicadaParaReferencia) -- usado pro aviso no checkout.
    promocaoRegras?: string;
    imagemUrl?: string;
    saldo?: number;
    // saldo real MENOS o que outros pedidos já reservaram -- limite de verdade pra continuar
    // comprando. statusDisponibilidade distingue 'esgotado' (saldo real zerado, alguém já
    // comprou/faturou) de 'em_pagamento' (saldo cobre, mas reservado por outro pedido pagando
    // agora -- pode voltar). Ver apollo-api EstoqueDisponibilidadeService.
    quantidadeDisponivel?: number;
    statusDisponibilidade?: 'disponivel' | 'esgotado' | 'em_pagamento';
}
