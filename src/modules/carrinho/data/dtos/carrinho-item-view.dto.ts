// View unificada usada pela UI (carrinho page / badge do header), venha da API (`CarrinhoDataSource`,
// autenticado) ou do storage local (`CarrinhoStorageService`, convidado). O storage local só guarda
// produtoId+quantidade -- nome/valor/imagemUrl ficam undefined nesse caso.
// ponytail: carrinho de convidado exibe só produtoId/quantidade (sem nome/preço/foto), pois não há
// endpoint público produto->referência pra enriquecer localmente. Resolve ao logar (sincroniza pra API).
export interface CarrinhoItemViewDto {
    produtoId?: number;
    quantidade?: number;
    nome?: string;
    valor?: number;
    imagemUrl?: string;
}
