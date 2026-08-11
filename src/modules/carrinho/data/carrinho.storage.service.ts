import { Injectable } from "@angular/core";
import { LocalStorageService } from "../../core/local_storage/local-storage.service";
import { CarrinhoItemDto } from "./dtos/carrinho-item.dto";

const CHAVE_CARRINHO_CONVIDADO = 'carrinho_convidado';

// Carrinho de quem ainda não está autenticado. Usa o mesmo `LocalStorageService` do token/perfil
// (localStorage não expira sozinho, dura muito mais que 24h) -- assim que a pessoa autenticar, o
// carrinho da API (POST/GET /carrinho) passa a ser a fonte de verdade e este storage pode ser
// limpo (`limpar()`), sem perder os itens que ela já tinha escolhido como visitante.
@Injectable({
    providedIn: 'root'
})
export class CarrinhoStorageService {

    constructor(private localStorageService: LocalStorageService) { }

    async recuperarItens(): Promise<CarrinhoItemDto[]> {
        var itens = await this.localStorageService.get<CarrinhoItemDto[]>(CHAVE_CARRINHO_CONVIDADO);
        return itens ?? [];
    }

    async adicionarOuAtualizarItem(item: CarrinhoItemDto): Promise<CarrinhoItemDto[]> {
        var itens = await this.recuperarItens();
        var existente = itens.find((i) => i.produtoId === item.produtoId);

        if (existente) {
            existente.quantidade = item.quantidade;
        } else {
            itens.push(item);
        }

        await this.localStorageService.set(CHAVE_CARRINHO_CONVIDADO, itens);
        return itens;
    }

    async removerItem(produtoId: number): Promise<CarrinhoItemDto[]> {
        var itens = (await this.recuperarItens()).filter((i) => i.produtoId !== produtoId);
        await this.localStorageService.set(CHAVE_CARRINHO_CONVIDADO, itens);
        return itens;
    }

    limpar(): boolean {
        return this.localStorageService.remove(CHAVE_CARRINHO_CONVIDADO);
    }
}
