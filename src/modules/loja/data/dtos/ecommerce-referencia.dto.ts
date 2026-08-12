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
}

export interface EcommerceReferenciaProdutoDto {
    produtoId: number;
    idExterno: string;
    corNome: string;
    tamanhoNome: string;
    disponivel: boolean;
    saldo: number;
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
