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
    valor?: number;
    valorPromocional?: number;
    imagemUrl?: string;
    saldo?: number;
}
