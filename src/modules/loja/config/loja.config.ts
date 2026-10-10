// Configuração única da vitrine da loja (handoff "Nova estrutura da loja Por Onde Flor").
//
// REGRA: bloco que o apollo-api ainda não sabe responder NASCE DESLIGADO (`ativo: false`) --
// a tela esconde o bloco em vez de mostrar valor inventado. Cada flag diz o que falta no backend
// e quando pode ser ligada. Quem tem dado real já vem ligado.
export const LOJA_CONFIG = {
    // Barra de campanha com contagem regressiva (README 1.1).
    // OCULTO até existir `GET /e-commerce/:id/campanha` (texto + data fim). Hoje não há nenhuma
    // entidade de campanha no apollo-api -- `/promocoes` traz desconto, não campanha com prazo
    // nem copy. Ligar quando o endpoint existir E `texto`/`fimEm` vierem dele, não daqui.
    campanha: {
        ativo: false,
        texto: 'Sale Por Onde Flor · até 40% off · últimos dias',
        fimEm: '',
    },

    // Faixa de benefícios: cupom, Pix, frete grátis (README 1.5).
    // OCULTO: não existe endpoint de cupom (`FLOR10`), nem de regra de Pix, nem de mínimo de frete
    // grátis. Ligar quando houver `GET /e-commerce/:id/beneficios` (ou equivalente) devolvendo
    // título/texto de cada item.
    beneficios: {
        ativo: false,
        itens: [
            { icone: 'cupom', titulo: 'Primeira compra', texto: '10% off com o cupom FLOR10' },
            { icone: 'desconto', titulo: '5% off no Pix', texto: 'Ou parcele em até 6x sem juros' },
            { icone: 'frete', titulo: 'Frete grátis', texto: 'Nas compras acima de R$ 399' },
        ],
    },

    // Barra de progresso de frete grátis na sacola (README 1.10) e linha "Frete grátis a partir de
    // R$ X" na PDP (README 2.4).
    // OCULTO: o mínimo de frete grátis não existe no apollo-api (nenhum campo em `EcommerceEntity`
    // nem no módulo de entrega -- confirmado por busca no origin/develop). Ligar quando o
    // branding/config da loja expuser esse valor; aí `minimo` vem de lá.
    freteGratis: { ativo: false, minimo: 399 },

    // Parcelamento ("Nx de R$ X sem juros") no card, na PDP e no modal de pagamento.
    // LIGADO por decisão da loja: o número de parcelas sem juros é definido AQUI, porque
    // `GET /e-commerce/:id/forma-pagamento` não expõe maxParcelas/juros. Quando o backend passar a
    // expor essa regra, trocar a origem do valor e deixar este arquivo só como fallback.
    // Escolha da loja: 6x, sem mínimo por parcela. Para parar de anunciar parcela de centavos em
    // produto barato, basta pôr um piso em `valorMinimoParcela` (ex.: 20 -> R$ 100 vira 5x).
    parcelamento: { ativo: true, maxParcelas: 6, valorMinimoParcela: 0 },

    // Preço no Pix com desconto + bloco Pix do modal de pagamento.
    // OCULTO: desconto por forma de pagamento existe em `/promocoes` (override por
    // formaDePagamentoId) e já é usado no preço do card -- mas "5% no Pix" como regra fixa da loja
    // não existe. Ligar só quando houver regra de Pix própria no backend.
    pix: { ativo: false, percentualDesconto: 5 },

    // "Compre junto / Complete o look" (README 2.5).
    // OCULTO e SEM UI: não existe endpoint de produtos complementares por referência, então nem a
    // tela foi construída (seria código morto que nunca renderiza). Quando houver
    // `GET .../referencias/:id/compre-junto`, construir o bloco e ligar esta flag.
    compreJunto: { ativo: false },

    // Newsletter (README 1.7).
    // OCULTO: não existe endpoint de inscrição em newsletter -- formulário ligado sem destino só
    // engana o cliente. Ligar quando houver `POST /e-commerce/:id/newsletter`.
    newsletter: { ativo: false },

    // Estampas da PDP: LIGADO -- dado real. `estampaNome` vem de
    // `GET .../referencias/:id/produtos` e a imagem do swatch vem da mídia da referência que
    // declara a mesma estampa (`ReferenciaMidiaDto.estampa`); sem mídia correspondente, o swatch
    // cai pro nome em texto. Nada é inventado.

    // Cálculo de frete por CEP na PDP: LIGADO -- `POST /e-commerce/:id/checkout/frete`
    // ({itens, cepDestino}) é cotação real da plataforma, já usada pelo checkout.
    freteCep: { ativo: true },

    // Botão flutuante de WhatsApp (README 1.9) e link do drawer.
    // OCULTO enquanto `numero` estiver vazio: não há telefone de atendimento no backend
    // (`/branding` devolve título/logo/banner/endereço, sem contato). Preencher aqui liga o botão.
    whatsapp: { numero: '', mensagem: 'Olá! Vim pelo site da Por Onde Flor.' },

    // Redes sociais do rodapé -- só aparece o que tiver URL preenchida (sem backend de redes).
    redes: [
        { nome: 'Instagram', url: '' },
        { nome: 'TikTok', url: '' },
        { nome: 'Pinterest', url: '' },
    ],

    // Colunas de link do rodapé. Sem backend de menu institucional: só rotas que existem de
    // verdade no site entram aqui (nada de link morto).
    rodape: [
        {
            titulo: 'Institucional',
            links: [{ nome: 'Regulamento do programa de pontos', rota: '/regulamento' }],
        },
        {
            titulo: 'Precisa de ajuda?',
            links: [
                { nome: 'Minha conta', rota: '/home' },
                { nome: 'Meus pedidos', rota: '/pedidos' },
            ],
        },
    ],

    // Bandeiras/meios exibidos como etiqueta no rodapé e no modal. Texto estático de informação,
    // não promessa de preço -- fica ligado.
    meiosPagamento: ['Visa', 'Mastercard', 'Elo', 'Amex', 'Pix'],

    // Guia de medidas (link ao lado de "Tamanho" na PDP).
    // OCULTO: não há página/arquivo de guia de medidas no site ainda. Preencher `url` liga o link.
    guiaMedidas: { url: '' },

    // Quantidade de referências por vitrine na home (query `limite` de
    // `GET .../catalogos/vitrine/home`).
    vitrineLimite: 12,
};

export type LojaConfig = typeof LOJA_CONFIG;
