import { Injectable } from "@angular/core";
import { VitrineListaResumoDto, VitrineMenuItemDto } from "../data/dtos/vitrine.dto";

// Item de menu já pronto pra tela. O mock de design desenha 3 níveis (item > grupo > link), mas a
// API só tem grupo > listas -- então o mega-menu tem 2 níveis: o item do menu e as colunas, cada
// coluna sendo uma lista do grupo (decisão do produto, backend não muda).
export interface MenuItemVm {
    id: number;
    label: string;
    rota: string[];
    /** Lista de filhos (só em item do tipo grupo) -- cada um vira uma coluna do mega-menu. */
    filhos: { id: number; label: string; rota: string[] }[];
    /** Imagem do item (`icone` da lista/grupo) usada na última coluna "Ver tudo em {label}". */
    imagem: string | null;
    /** Título em bordô (#6D4141) quando a lista se chama "Sale"/"Promoção" etc. */
    destaque: boolean;
}

const PALAVRAS_DESTAQUE = ['sale', 'promo', 'oferta', 'liquida', 'outlet'];

@Injectable({ providedIn: 'root' })
export class MenuVitrineService {
    // Grupo sem nenhuma lista vinculada vira link direto (sem chevron) em vez de abrir mega-menu
    // vazio. Lista/grupo sem nome é descartada (nada de item "undefined" no menu).
    montar(itens: VitrineMenuItemDto[]): MenuItemVm[] {
        return [...itens]
            .sort((a, b) => a.ordem - b.ordem)
            .filter((item) => !!item.nome?.trim())
            .map((item) => ({
                id: item.id,
                label: item.nome!.trim(),
                rota: this.rota(item),
                filhos: item.tipo === 'grupo' ? this.filhos(item.listas) : [],
                imagem: item.icone || null,
                destaque: this.ehDestaque(item.nome!),
            }));
    }

    private filhos(listas: VitrineListaResumoDto[]): MenuItemVm['filhos'] {
        return [...(listas ?? [])]
            .sort((a, b) => a.ordem - b.ordem)
            .filter((lista) => !!lista.nome?.trim())
            .map((lista) => ({ id: lista.id, label: lista.nome!.trim(), rota: ['/loja/lista', String(lista.id)] }));
    }

    // Grupo não é uma lista do catálogo -- não tem página própria (`GET /catalogos/listas/:id` dá
    // 404 pra id de grupo). O "Ver tudo" de um grupo cai na primeira lista dele; sem listas, o
    // próprio item é uma lista e tem página.
    private rota(item: VitrineMenuItemDto): string[] {
        if (item.tipo === 'grupo') {
            const primeira = [...(item.listas ?? [])].sort((a, b) => a.ordem - b.ordem)[0];
            return primeira ? ['/loja/lista', String(primeira.id)] : ['/loja'];
        }
        return ['/loja/lista', String(item.id)];
    }

    // Título em bordô: usado pelo menu e pelos títulos de vitrine da home.
    ehDestaque(nome: string | null): boolean {
        const normalizado = (nome ?? '').toLowerCase();
        return PALAVRAS_DESTAQUE.some((palavra) => normalizado.includes(palavra));
    }
}
