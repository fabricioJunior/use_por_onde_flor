// Junta cor/tamanho/estampa (todos opcionais, estampa é a maioria null) num label só, separado por
// " · ", pulando o que estiver ausente. Reusado em carrinho/checkout/pedido-detalhe -- mesmo texto
// que antes era montado inline só com cor+tamanho.
export function descricaoVariacao(cor?: string, tamanho?: string, estampa?: string): string {
    return [cor, tamanho, estampa].filter((valor): valor is string => !!valor).join(' · ');
}
