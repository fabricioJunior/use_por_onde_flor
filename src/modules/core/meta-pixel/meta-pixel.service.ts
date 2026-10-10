import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { firstValueFrom } from "rxjs";
import { MetaPixelDataSource, MetaPurchaseDto } from "./meta-pixel.data.source";

declare global {
    interface Window {
        fbq?: any;
        _fbq?: any;
    }
}

export const META_MOEDA = 'BRL';
const META_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';
const CHAVE_PURCHASE_ENVIADO = 'meta_purchase_enviado_';
const CHAVE_USUARIO_DA_SESSAO = 'usuario_da_sessao'; // gravada por AutenticacaoService.fazerLogin
const NOVENTA_DIAS_S = 90 * 24 * 60 * 60;

// Item de evento do Pixel. `idExterno` (se o DTO já tiver) evita ida ao backend; sem ele, o content_id vem de
// POST /meta-pixel/content-ids -- a regra (idExterno do SKU, senão o id do produto) fica só no backend, igual à
// do catálogo e à do Purchase do servidor, pra o mesmo produto ter SEMPRE o mesmo id nos três lugares.
export interface MetaItemPixel {
    produtoId: number;
    idExterno?: string | null;
    quantidade: number;
    valor: number;
}

// ÚNICO ponto do site que fala com o `fbq`. Nenhum componente chama `fbq` direto.
// Garantias: (1) o site nunca espera nem quebra por causa da Meta (config assíncrona, script async, todo erro
// engolido); (2) em SSR não faz nada; (3) eventos disparados antes da inicialização ficam numa fila.
// Consentimento: o site não tem mecanismo de cookies/consentimento hoje, então o Pixel carrega sempre que o
// backend o habilita (META_PIXEL_ID). Se um banner for criado, é só chamar `iniciar()` depois do aceite.
@Injectable({ providedIn: 'root' })
export class MetaPixelService {
    private readonly navegador: boolean;
    private pixelId?: string;
    private estado: 'parado' | 'iniciando' | 'pronto' | 'desabilitado' = 'parado';
    private fila: Array<() => void> = [];
    private readonly cacheContentIds = new Map<number, string>();

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private dataSource: MetaPixelDataSource,
    ) {
        this.navegador = isPlatformBrowser(platformId);
    }

    // Idempotente e seguro de chamar sem await: nunca lança.
    async iniciar(): Promise<void> {
        if (!this.navegador || this.estado !== 'parado') {
            return;
        }
        this.estado = 'iniciando';
        this.guardarFbcDoClique(); // antes de qualquer await: o roteador pode apagar o ?fbclid da URL
        try {
            const config = await firstValueFrom(this.dataSource.config());
            if (!config?.habilitado || !config.pixelId) {
                this.desabilitar();
                return;
            }
            this.carregarScript();
            this.pixelId = config.pixelId;
            this.init();
            this.estado = 'pronto';
            console.info(JSON.stringify({ evento: 'META_PIXEL_INITIALIZED', pixelId: config.pixelId }));
            this.descarregarFila();
        } catch {
            // Meta/backend indisponível: segue sem Pixel, sem afetar a página.
            this.desabilitar();
        }
    }

    // Advanced Matching: chamar depois do login (o `init` roda antes, com o usuário ainda anônimo). Reenviar o
    // `init` com os dados é o método documentado pela Meta; o Pixel faz o hash no navegador.
    atualizarUsuario(): void {
        if (this.estado === 'pronto') {
            this.init();
        }
    }

    pageView(): void {
        this.enviar('PageView');
    }

    // Produto visto na página de produto. Sem SKU escolhido ainda: product_group com o item_group_id.
    viewContent(dados: { contentIds: string[]; contentType: 'product' | 'product_group'; value: number }): void {
        this.enviar('ViewContent', {
            content_ids: dados.contentIds,
            content_type: dados.contentType,
            value: arredondar(dados.value),
            currency: META_MOEDA,
        });
    }

    async addToCart(itens: MetaItemPixel[]): Promise<void> {
        const contents = await this.montarContents(itens);
        if (!contents.length) {
            return;
        }
        this.enviar('AddToCart', {
            content_ids: contents.map((c) => c.id),
            content_type: 'product',
            value: arredondar(contents.reduce((soma, c) => soma + c.quantity * c.item_price, 0)),
            currency: META_MOEDA,
            contents,
        });
    }

    async initiateCheckout(itens: MetaItemPixel[]): Promise<void> {
        const contents = await this.montarContents(itens);
        if (!contents.length) {
            return;
        }
        this.enviar('InitiateCheckout', {
            content_ids: contents.map((c) => c.id),
            content_type: 'product',
            value: arredondar(contents.reduce((soma, c) => soma + c.quantity * c.item_price, 0)),
            currency: META_MOEDA,
            contents,
            num_items: contents.reduce((soma, c) => soma + c.quantity, 0),
        });
    }

    // Página de confirmação: pergunta ao BACKEND se o pedido está pago. Abrir a página (ou ?pago=1 na URL) NÃO
    // conta como compra -- só o que o backend confirma. O redirect do gateway pode chegar antes do webhook de
    // pagamento ser processado, então enquanto o backend responder "pagamento ainda não confirmado" tenta de novo
    // algumas vezes (com limite).
    async purchaseDoPedido(pedidoId: number, token: string, opcoes: { tentativas?: number; esperaMs?: number } = {}): Promise<void> {
        if (!this.navegador || this.estado === 'desabilitado') {
            return;
        }
        const tentativas = opcoes.tentativas ?? 4;
        const esperaMs = opcoes.esperaMs ?? 4000;

        for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
            try {
                const dados = await firstValueFrom(this.dataSource.purchase(pedidoId, token));
                if (dados?.elegivel) {
                    this.purchase(dados);
                    return;
                }
                if (dados?.motivo !== 'PAGAMENTO_NAO_CONFIRMADO') {
                    return; // pedido cancelado, fora da janela, pixel desligado...: não vai mudar
                }
            } catch {
                return; // falha ao consultar nunca atrapalha a tela do pedido
            }
            if (tentativa < tentativas) {
                await new Promise((resolve) => setTimeout(resolve, esperaMs));
            }
        }
    }

    // O `eventID` é exatamente o `event_id` que o backend usa no envio server-side (order_<id do pedido>), e
    // vem PRONTO do backend: o site nunca o monta. Mesmo evento + mesmo ID = a Meta deduplica Pixel x CAPI.
    purchase(dados: Extract<MetaPurchaseDto, { elegivel: true }>): void {
        if (!this.navegador || this.estado === 'desabilitado') {
            return;
        }
        if (this.purchaseJaEnviado(dados.eventId)) {
            return; // recarregar a página não duplica o evento no navegador
        }
        this.marcarPurchaseEnviado(dados.eventId);
        this.enviar(
            'Purchase',
            {
                value: dados.value,
                currency: dados.currency,
                content_ids: dados.content_ids,
                content_type: dados.content_type,
                contents: dados.contents,
                num_items: dados.num_items,
            },
            { eventID: dados.eventId },
        );
    }

    // Cookies do Pixel pro backend casar o Purchase do servidor com o do navegador. Só existem se o Pixel está ativo.
    dadosDeRastreio(): { fbp?: string; fbc?: string } | undefined {
        if (!this.navegador || this.estado === 'desabilitado') {
            return undefined;
        }
        const fbp = this.cookie('_fbp');
        let fbc = this.cookie('_fbc');
        if (!fbc) {
            const fbclid = new URLSearchParams(window.location.search).get('fbclid');
            if (fbclid) {
                fbc = `fb.1.${Date.now()}.${fbclid}`;
            }
        }
        return fbp || fbc ? { ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}) } : undefined;
    }

    // ---- internos ----

    private init(): void {
        const usuario = this.dadosDoUsuario();
        if (usuario) {
            window.fbq('init', this.pixelId, usuario);
        } else {
            window.fbq('init', this.pixelId);
        }
    }

    // Só o que o cadastro já tem; endereço e gênero o site não conhece (o Purchase do servidor leva o endereço).
    private dadosDoUsuario(): Record<string, string> | undefined {
        let usuario: any;
        try {
            usuario = JSON.parse(localStorage.getItem(CHAVE_USUARIO_DA_SESSAO) ?? 'null');
        } catch {
            return undefined;
        }
        if (!usuario) {
            return undefined;
        }
        const dados: Record<string, string> = {};
        const email = String(usuario.email ?? '').trim().toLowerCase();
        if (email.includes('@')) dados['em'] = email;
        const telefone = String(usuario.telefone ?? '').replace(/\D/g, '').replace(/^0+/, '');
        if (telefone.length === 10 || telefone.length === 11) dados['ph'] = '55' + telefone;
        else if ((telefone.length === 12 || telefone.length === 13) && telefone.startsWith('55')) dados['ph'] = telefone;
        const nome = String(usuario.nome ?? '').trim().toLowerCase().split(/\s+/)[0];
        if (nome) dados['fn'] = nome;
        const sobrenome = String(usuario.sobrenome ?? '').trim().toLowerCase().split(/\s+/).pop();
        if (sobrenome) dados['ln'] = sobrenome;
        const nascimento = String(usuario.dataNascimento ?? '').slice(0, 10).replace(/-/g, '');
        if (/^\d{8}$/.test(nascimento)) dados['db'] = nascimento;
        if (usuario.id) dados['external_id'] = String(usuario.id);
        return Object.keys(dados).length ? dados : undefined;
    }

    // Quem chega por anúncio traz ?fbclid. O Pixel grava o cookie _fbc sozinho, mas só depois de baixar o script;
    // se o usuário já navegou, o fbclid se perdeu. Formato oficial: fb.1.<timestamp ms>.<fbclid>.
    private guardarFbcDoClique(): void {
        try {
            if (this.cookie('_fbc')) {
                return;
            }
            const fbclid = new URLSearchParams(window.location.search).get('fbclid');
            if (fbclid) {
                document.cookie = `_fbc=fb.1.${Date.now()}.${encodeURIComponent(fbclid)}; path=/; max-age=${NOVENTA_DIAS_S}; SameSite=Lax`;
            }
        } catch {
            // cookie bloqueado: o Pixel ainda tenta por conta própria
        }
    }

    private enviar(evento: string, parametros?: object, opcoes?: { eventID: string }): void {
        if (!this.navegador || this.estado === 'desabilitado') {
            return;
        }
        const disparar = () => {
            try {
                if (opcoes) {
                    window.fbq('track', evento, parametros ?? {}, opcoes);
                } else if (parametros) {
                    window.fbq('track', evento, parametros);
                } else {
                    window.fbq('track', evento);
                }
                console.debug(JSON.stringify({ evento: 'META_EVENT_SENT', tipo: evento, eventID: opcoes?.eventID }));
            } catch {
                // fbq com defeito não derruba a página
            }
        };
        if (this.estado === 'pronto') {
            disparar();
        } else {
            this.fila.push(disparar);
        }
    }

    private async montarContents(itens: MetaItemPixel[]): Promise<{ id: string; quantity: number; item_price: number }[]> {
        const faltando = itens.filter((i) => !(i.idExterno ?? '').trim()).map((i) => i.produtoId);
        await this.resolverContentIds(faltando);
        return itens
            .map((item) => ({
                id: (item.idExterno ?? '').trim() || this.cacheContentIds.get(item.produtoId) || '',
                quantity: item.quantidade,
                item_price: arredondar(item.valor),
            }))
            .filter((c) => c.id !== '' && c.quantity > 0);
    }

    private async resolverContentIds(produtoIds: number[]): Promise<void> {
        const pendentes = [...new Set(produtoIds)].filter((id) => !this.cacheContentIds.has(id));
        if (!pendentes.length || !this.navegador || this.estado === 'desabilitado') {
            return;
        }
        try {
            const { ids } = await firstValueFrom(this.dataSource.contentIds(pendentes));
            Object.entries(ids ?? {}).forEach(([produtoId, contentId]) => this.cacheContentIds.set(Number(produtoId), contentId));
        } catch {
            // sem o mapa o item é omitido do evento (nunca se inventa um id diferente do catálogo)
        }
    }

    private carregarScript(): void {
        if (window.fbq) {
            return;
        }
        // Mesmo bootstrap do snippet oficial do Pixel: fbq já existe (e enfileira) antes do script baixar, então
        // chamadas nunca falham mesmo que connect.facebook.net demore ou esteja bloqueado.
        const fbq: any = (window.fbq = function (...args: unknown[]) {
            fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
        });
        if (!window._fbq) {
            window._fbq = fbq;
        }
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];

        const script = document.createElement('script');
        script.async = true;
        script.src = META_SCRIPT_URL;
        document.head.appendChild(script);
    }

    private descarregarFila(): void {
        const fila = this.fila;
        this.fila = [];
        fila.forEach((disparar) => disparar());
    }

    private desabilitar(): void {
        this.estado = 'desabilitado';
        this.fila = [];
    }

    private purchaseJaEnviado(eventId: string): boolean {
        try {
            return localStorage.getItem(CHAVE_PURCHASE_ENVIADO + eventId) === '1';
        } catch {
            return false;
        }
    }

    private marcarPurchaseEnviado(eventId: string): void {
        try {
            localStorage.setItem(CHAVE_PURCHASE_ENVIADO + eventId, '1');
        } catch {
            // storage indisponível: o dedupe da Meta (eventID) ainda cobre
        }
    }

    private cookie(nome: string): string | undefined {
        const par = document.cookie.split('; ').find((c) => c.startsWith(nome + '='));
        return par ? decodeURIComponent(par.substring(nome.length + 1)) : undefined;
    }
}

function arredondar(valor: number): number {
    return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}
