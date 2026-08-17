// Shape de `view_ecommerces_referencias` (apollo-api EcommerceReferenciaView) -- ver
// apps/api/src/modules/ecommerce/ecommerce-referencia/view/ecommerce-referencia.view.ts.
export interface EcommerceReferenciaDto {
    id: number;
    ecommerceId: number;
    empresaId: number;
    referenciaId: number;
    nome: string;
    idExterno: string;
    descricao?: string;
    valor: number;
    media_tipo?: string;
    media_url?: string;
    rascunho?: boolean;
    // GROUP_CONCAT de produtoId disponíveis, separados por vírgula. Null quando nenhum disponível.
    produtosDisponiveisIds?: string | null;
    // Soma do saldo real dos produtos disponíveis (view_estoque_produtos) -- "disponivel" no vínculo
    // é flag manual do admin, independente de estoque; precisa checar as duas coisas.
    saldo?: number;
    // Calculado no front (PromocaoPrecoService) a partir de GET /e-commerce/{id}/promocoes -- não
    // vem da API. Presente só quando há promoção ativa aplicável, sempre menor que `valor`.
    valorPromocional?: number;
}

export interface EcommerceReferenciaProdutoDto {
    produtoId: number;
    idExterno: string;
    corNome: string;
    tamanhoNome: string;
    disponivel: boolean;
    saldo: number;
    // saldo real MENOS o que outros pedidos já reservaram (estoque virtual) -- limite de verdade
    // pra seleção/quantidade, sempre <= saldo. Ver apollo-api EstoqueDisponibilidadeService.
    // Opcional: ausente quando o backend em produção ainda não tem esse campo (deploy assíncrono
    // front/back) -- nesse caso cai no fallback via `saldo` (ver temEstoque/incrementarQuantidade).
    quantidadeDisponivel?: number;
    statusDisponibilidade?: 'disponivel' | 'esgotado' | 'em_pagamento';
}

export interface PaginationMetaDto {
    total_items: number;
    item_count: number;
    items_per_page: number;
    total_pages: number;
    current_page: number;
    has_next_page: boolean;
}

export interface PaginationDto<T> {
    meta: PaginationMetaDto;
    items: T[];
}
