import { Injectable } from "@angular/core";
import { PromocaoDto } from "../data/dtos/promocao.dto";

// Mesma matemática de apollo-api DescontoCalculatorService (sem estado, sem I/O) -- catálogo
// público não tem endpoint de preço-com-desconto pronto, então calcula aqui a partir da lista de
// promoções ativas (GET /e-commerce/{id}/promocoes), que já vem com tipoDesconto/referenciaIds.
@Injectable({ providedIn: 'root' })
export class PromocaoPrecoService {
    // Mapa referenciaId -> melhor promoção aplicável (menor valorFinal). Só considera escopo
    // 'geral' (todas as referências) e 'referencias' (lista explícita) -- combo_kit/combo_leve_pague
    // dependem do carrinho inteiro, não fazem sentido pro preço unitário do catálogo.
    montarMapa(promocoes: PromocaoDto[]): Map<number, PromocaoDto> {
        const gerais = promocoes.filter((p) => p.tipoEscopo === 'geral');
        const porReferencia = promocoes.filter((p) => p.tipoEscopo === 'referencias');

        const candidatas = new Map<number, PromocaoDto[]>();

        for (const promocao of porReferencia) {
            for (const referenciaId of promocao.referenciaIds ?? []) {
                const lista = candidatas.get(referenciaId) ?? [];
                lista.push(promocao);
                candidatas.set(referenciaId, lista);
            }
        }

        const mapa = new Map<number, PromocaoDto>();
        for (const [referenciaId, lista] of candidatas) {
            mapa.set(referenciaId, this.melhorPromocao(lista, 100));
        }
        return mapa;
    }

    // gerais precisa do valorBase real pra comparar com as por-referência -- resolve por item em
    // `calcularParaReferencia`, não aqui (não há valorBase único fixo pra ordenar promoção geral).
    promocoesGerais(promocoes: PromocaoDto[]): PromocaoDto[] {
        return promocoes.filter((p) => p.tipoEscopo === 'geral');
    }

    calcularParaReferencia(referenciaId: number, valorBase: number, mapaPorReferencia: Map<number, PromocaoDto>, gerais: PromocaoDto[]): number | null {
        const aplicada = this.promocaoAplicadaParaReferencia(referenciaId, valorBase, mapaPorReferencia, gerais);
        return aplicada?.valorFinal ?? null;
    }

    // Mesma lógica de `calcularParaReferencia`, mas devolve também QUAL promoção venceu (não só o
    // valor) -- usado pro aviso de regras no carrinho/checkout, que precisa saber de qual promoção
    // veio o desconto aplicado em cada item.
    promocaoAplicadaParaReferencia(
        referenciaId: number,
        valorBase: number,
        mapaPorReferencia: Map<number, PromocaoDto>,
        gerais: PromocaoDto[],
    ): { promocao: PromocaoDto; valorFinal: number } | null {
        const melhor = this.melhorResultado(referenciaId, valorBase, mapaPorReferencia, gerais);
        return melhor ? { promocao: melhor.promocao, valorFinal: melhor.valorFinal } : null;
    }

    // Maior desconto possível pra essa referência, considerando TAMBÉM os overrides por forma de
    // pagamento de cada promoção candidata (não só o desconto padrão) -- é o que o card do catálogo
    // usa pra anunciar "até X% OFF no <forma>" antes de qualquer outra informação de preço.
    // Estimativa client-side (mesma ressalva das outras funções deste service): backend recalcula
    // de verdade no checkout, isso aqui é só pra exibição.
    melhorOpcaoParaReferencia(
        referenciaId: number,
        valorBase: number,
        mapaPorReferencia: Map<number, PromocaoDto>,
        gerais: PromocaoDto[],
        nomesFormaPagamento: Map<number, string>,
    ): { percentualOff: number; formaPagamentoNome: string | null } | null {
        const melhor = this.melhorResultado(referenciaId, valorBase, mapaPorReferencia, gerais, nomesFormaPagamento);
        if (!melhor) {
            return null;
        }
        const percentualOff = Math.round(((valorBase - melhor.valorFinal) / valorBase) * 100);
        return percentualOff > 0 ? { percentualOff, formaPagamentoNome: melhor.formaPagamentoNome } : null;
    }

    // Menor preço final possível pra essa referência entre TODAS as candidatas (geral + específica)
    // E seus overrides por forma de pagamento -- usado tanto pro preço riscado quanto pro badge, pra
    // nunca mostrar um desconto "global" quando existe um override maior (ex: Pix) disponível.
    private melhorResultado(
        referenciaId: number,
        valorBase: number,
        mapaPorReferencia: Map<number, PromocaoDto>,
        gerais: PromocaoDto[],
        nomesFormaPagamento?: Map<number, string>,
    ): { promocao: PromocaoDto; valorFinal: number; formaPagamentoNome: string | null } | null {
        const candidatas = [...gerais];
        const especifica = mapaPorReferencia.get(referenciaId);
        if (especifica) {
            candidatas.push(especifica);
        }
        if (candidatas.length === 0 || valorBase <= 0) {
            return null;
        }

        let melhor: { promocao: PromocaoDto; valorFinal: number; formaPagamentoNome: string | null } | null = null;

        const considerar = (promocao: PromocaoDto, valorFinal: number, formaNome: string | null) => {
            if (valorFinal < valorBase && (!melhor || valorFinal < melhor.valorFinal)) {
                melhor = { promocao, valorFinal, formaPagamentoNome: formaNome };
            }
        };

        for (const promocao of candidatas) {
            // Desconto padrão (sem forma específica) só conta se a promoção não restringir a forma
            // -- promoção restrita só vale nas formas listadas em `formasPagamento`.
            if (!promocao.restringirFormasPagamento) {
                considerar(promocao, this.calcular(promocao, valorBase), null);
            }

            for (const override of promocao.formasPagamento ?? []) {
                const promocaoComOverride: PromocaoDto = {
                    ...promocao,
                    valorPercentual: override.valorPercentual ?? promocao.valorPercentual,
                    valorFixo: override.valorFixo ?? promocao.valorFixo,
                    precoFixo: override.precoFixo ?? promocao.precoFixo,
                };
                const nome = nomesFormaPagamento?.get(override.formaDePagamentoId) ?? null;
                considerar(promocao, this.calcular(promocaoComOverride, valorBase), nome);
            }
        }

        return melhor;
    }

    private melhorPromocao(promocoes: PromocaoDto[], valorBase: number): PromocaoDto {
        return promocoes.reduce((melhor, atual) => (this.calcular(atual, valorBase) < this.calcular(melhor, valorBase) ? atual : melhor));
    }

    private calcular(promocao: PromocaoDto, valorBase: number): number {
        if (promocao.tipoDesconto === 'percentual') {
            const bruto = (valorBase * (promocao.valorPercentual ?? 0)) / 100;
            const desconto = Math.min(bruto, promocao.valorDescontoMaximo ?? Infinity);
            return valorBase - desconto;
        }

        if (promocao.tipoDesconto === 'valor_fixo') {
            const desconto = Math.min(promocao.valorFixo ?? 0, valorBase);
            return valorBase - desconto;
        }

        // preco_fixo: nunca aumenta o preço.
        return Math.min(promocao.precoFixo ?? valorBase, valorBase);
    }
}
