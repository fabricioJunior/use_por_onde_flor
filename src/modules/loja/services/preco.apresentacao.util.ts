import { LOJA_CONFIG } from "../config/loja.config";

export function formatarPreco(valor: number | undefined | null): string {
    return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// "ou Nx de R$ X sem juros". Só existe quando `parcelamento.ativo` -- sem regra real de parcelas no
// backend a frase fica oculta (ver loja.config.ts). N = min(maxParcelas, preço / valorMinimoParcela).
export function textoParcelamento(preco: number): string | null {
    const { ativo, maxParcelas, valorMinimoParcela } = LOJA_CONFIG.parcelamento;
    if (!ativo || !preco || preco <= 0) {
        return null;
    }
    const n = Math.max(1, Math.min(maxParcelas, Math.floor(preco / valorMinimoParcela)));
    return n > 1 ? `ou ${n}x de ${formatarPreco(preco / n)} sem juros` : null;
}

export function parcelas(preco: number): { numero: number; valor: number }[] {
    const { ativo, maxParcelas, valorMinimoParcela } = LOJA_CONFIG.parcelamento;
    if (!ativo || !preco || preco <= 0) {
        return [];
    }
    const maximo = Math.max(1, Math.min(maxParcelas, Math.floor(preco / valorMinimoParcela)));
    return Array.from({ length: maximo }, (_, i) => ({ numero: i + 1, valor: preco / (i + 1) }));
}

export function precoPix(preco: number): number | null {
    const { ativo, percentualDesconto } = LOJA_CONFIG.pix;
    return ativo && preco > 0 ? preco * (1 - percentualDesconto / 100) : null;
}

// Barra de frete grátis da sacola. `null` quando a regra está desligada (sem mínimo no backend).
export function progressoFreteGratis(subtotal: number): { falta: number; percentual: number } | null {
    const { ativo, minimo } = LOJA_CONFIG.freteGratis;
    if (!ativo || minimo <= 0) {
        return null;
    }
    return {
        falta: Math.max(0, minimo - subtotal),
        percentual: Math.min(100, (subtotal / minimo) * 100),
    };
}
