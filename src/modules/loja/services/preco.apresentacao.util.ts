import { LOJA_CONFIG } from "../config/loja.config";

export function formatarPreco(valor: number | undefined | null): string {
    return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Nº de parcelas sem juros: o teto vem da config da loja; `valorMinimoParcela > 0` ainda corta
// parcela pequena demais (R$ 40 em 10x viraria 10x de R$ 4). Com 0, vale só o teto.
function maximoDeParcelas(preco: number): number {
    const { ativo, maxParcelas, valorMinimoParcela } = LOJA_CONFIG.parcelamento;
    if (!ativo || !preco || preco <= 0) {
        return 0;
    }
    const porValor = valorMinimoParcela > 0 ? Math.floor(preco / valorMinimoParcela) : maxParcelas;
    return Math.max(1, Math.min(maxParcelas, porValor));
}

// "Nx de R$ X sem juros", abaixo do preço.
export function textoParcelamento(preco: number): string | null {
    const n = maximoDeParcelas(preco);
    return n > 1 ? `${n}x de ${formatarPreco(preco / n)} sem juros` : null;
}

export function parcelas(preco: number): { numero: number; valor: number }[] {
    const maximo = maximoDeParcelas(preco);
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
