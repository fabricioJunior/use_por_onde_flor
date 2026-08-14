// Camada de apresentação SÓ pro front -- não altera nem unifica o que está persistido (`corNome`
// vem cru da API, ex "bege", "AZUL CEU", "azul bebe"). Cada string é tratada isoladamente: nunca
// mescla "VERDE MIL" com "VERDE MILITAR" nem nada parecido, só arruma capitalização/acento da
// MESMA string. Ver prompt do usuário (2026-08-13): não mexer no banco, não inventar relação.

// Acento só pra palavras conhecidas com match exato (case-insensitive) -- fora daqui, só Title Case,
// sem chute de acentuação.
const PALAVRAS_ACENTUADAS: Record<string, string> = {
    ceu: 'Céu',
    bebe: 'Bebê',
    bordo: 'Bordô',
    cafe: 'Café',
    marrom: 'Marrom',
    marron: 'Marrom', // erro de digitação comum no cadastro, mas é a mesma palavra -- só ortografia
};

export function normalizarNomeCor(nomeCru: string): string {
    return nomeCru
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((palavra) => PALAVRAS_ACENTUADAS[palavra] ?? (palavra.charAt(0).toUpperCase() + palavra.slice(1)))
        .join(' ');
}

// Swatch: mapa de apresentação (nome normalizado, lowercase sem acento, -> hex aproximado).
// CorEntity.hex existe no banco mas está null em 100% dos registros hoje (checado via API) -- não
// dá pra usar. Fallback (null) = swatch neutro (padrão listrado, ver .swatch-neutro no CSS), nunca
// inventa uma cor pra algo desconhecido.
const HEX_POR_COR: Record<string, string> = {
    preto: '#1a1a1a',
    branco: '#ffffff',
    off: '#f2ede1',
    bege: '#d9c7a3',
    caramelo: '#a8703a',
    marrom: '#5c4033',
    chumbo: '#4b4b50',
    cinza: '#8c8c8c',
    'azul marinho': '#1b2a4a',
    azul: '#3a5a91',
    'azul céu': '#7fb3d5',
    'azul mar': '#2e6f8e',
    'azul bebê': '#a9d1e8',
    'azul claro': '#9fc9e8',
    'azul escuro': '#1f3a63',
    jeans: '#5f7896',
    denim: '#5f7896',
    verde: '#417a45',
    'verde militar': '#5a6b3d',
    'verde mil': '#5a6b3d',
    'verde água': '#7fc9b8',
    amarelo: '#e6c83c',
    'amarelo manteiga': '#f0d878',
    rosa: '#e696af',
    pink: '#e8449e',
    roxo: '#6e3c8c',
    vinho: '#641e2a',
    bordô: '#641e2a',
    bordo: '#641e2a',
    vermelho: '#b42828',
    laranja: '#dc6e28',
    nude: '#d2af96',
    dourado: '#bea05a',
    prata: '#bebebe',
    telha: '#b5591f',
    abacate: '#6b7f3a',
    pistache: '#a3b06a',
    terracota: '#b3562f',
    castanho: '#5a3d2b',
    café: '#4a3222',
};

const NOME_CLAREZA_LIMIAR = 200; // luminância (0-255) acima disso = cor clara, precisa de borda extra

export function corParaHex(nomeNormalizado: string): string | null {
    const chave = nomeNormalizado.trim().toLowerCase();
    return HEX_POR_COR[chave] ?? null;
}

export function corEhClara(hex: string | null): boolean {
    if (!hex) {
        return false; // swatch neutro já tem borda própria, não precisa do tratamento extra
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminancia > NOME_CLAREZA_LIMIAR;
}
