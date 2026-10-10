import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MetaPixelDataSource, MetaPurchaseDto } from './meta-pixel.data.source';
import { MetaPixelService } from './meta-pixel.service';

type Compra = Extract<MetaPurchaseDto, { elegivel: true }>;

// Mesmos valores que o backend monta pro CAPI (custom_data + event_id) -- o Pixel recebe EXATAMENTE isso.
const compraDoBackend = (extra: Partial<Compra> = {}): Compra => ({
    elegivel: true,
    eventId: 'order_123',
    currency: 'BRL',
    value: 259.7,
    content_ids: ['SKU-001', 'SKU-002'],
    content_type: 'product',
    contents: [
        { id: 'SKU-001', quantity: 2, item_price: 79.9 },
        { id: 'SKU-002', quantity: 1, item_price: 99.9 },
    ],
    num_items: 3,
    order_id: '123',
    ...extra,
});

describe('MetaPixelService', () => {
    let service: MetaPixelService;
    let dataSource: jasmine.SpyObj<MetaPixelDataSource>;
    let fbq: jasmine.Spy;

    const criar = (platform: 'browser' | 'server' = 'browser') => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PLATFORM_ID, useValue: platform },
                { provide: MetaPixelDataSource, useValue: dataSource },
            ],
        });
        service = TestBed.inject(MetaPixelService);
    };

    const chamadas = (evento: string) => fbq.calls.allArgs().filter((args) => args[0] === 'track' && args[1] === evento);

    beforeEach(() => {
        localStorage.clear();
        // fbq já existente => o serviço NÃO injeta o script real da Meta (nenhuma chamada de rede nos testes)
        fbq = jasmine.createSpy('fbq');
        (window as any).fbq = fbq;
        dataSource = jasmine.createSpyObj('MetaPixelDataSource', ['config', 'contentIds', 'purchase']);
        dataSource.config.and.returnValue(of({ habilitado: true, pixelId: '555' }));
        dataSource.contentIds.and.returnValue(of({ ids: {} }));
        spyOn(console, 'info');
        spyOn(console, 'debug');
    });

    afterEach(() => {
        delete (window as any).fbq;
        delete (window as any)._fbq;
        localStorage.clear();
    });

    describe('inicialização', () => {
        it('com o Pixel habilitado: fbq("init", pixelId) e log META_PIXEL_INITIALIZED', async () => {
            criar();
            await service.iniciar();

            expect(fbq).toHaveBeenCalledWith('init', '555');
            expect(console.info).toHaveBeenCalledWith(jasmine.stringMatching('META_PIXEL_INITIALIZED'));
        });

        it('inicia uma vez só (idempotente)', async () => {
            criar();
            await service.iniciar();
            await service.iniciar();
            expect(dataSource.config).toHaveBeenCalledTimes(1);
            expect(fbq.calls.allArgs().filter((a) => a[0] === 'init').length).toBe(1);
        });

        it('backend sem Pixel configurado: nada é carregado e eventos são descartados', async () => {
            dataSource.config.and.returnValue(of({ habilitado: false, pixelId: null }));
            criar();
            await service.iniciar();
            service.pageView();

            expect(fbq).not.toHaveBeenCalled();
        });

        it('backend/Meta indisponível não lança nem afeta a página', async () => {
            dataSource.config.and.returnValue(throwError(() => new Error('500')));
            criar();

            await expectAsync(service.iniciar()).toBeResolved();
            service.pageView();
            expect(fbq).not.toHaveBeenCalled();
        });

        it('em SSR (servidor) não faz nada', async () => {
            criar('server');
            await service.iniciar();
            service.pageView();

            expect(dataSource.config).not.toHaveBeenCalled();
            expect(fbq).not.toHaveBeenCalled();
        });

        it('eventos disparados ANTES da inicialização ficam na fila e saem depois do init', async () => {
            criar();
            service.pageView(); // chega antes do iniciar()
            expect(fbq).not.toHaveBeenCalled();

            await service.iniciar();

            const ordem = fbq.calls.allArgs().map((a) => a[0] + ':' + (a[1] ?? ''));
            expect(ordem).toEqual(['init:555', 'track:PageView']);
        });
    });

    describe('PageView', () => {
        it('dispara fbq("track", "PageView")', async () => {
            criar();
            await service.iniciar();
            service.pageView();
            expect(fbq).toHaveBeenCalledWith('track', 'PageView');
        });
    });

    describe('ViewContent', () => {
        it('envia content_ids, content_type, value e currency (BRL)', async () => {
            criar();
            await service.iniciar();
            service.viewContent({ contentIds: ['REF-500'], contentType: 'product_group', value: 159.9 });

            expect(chamadas('ViewContent')[0][2]).toEqual({
                content_ids: ['REF-500'],
                content_type: 'product_group',
                value: 159.9,
                currency: 'BRL',
            });
        });
    });

    describe('AddToCart', () => {
        it('envia content_ids, content_type, value, currency e contents usando o idExterno do SKU', async () => {
            criar();
            await service.iniciar();
            await service.addToCart([{ produtoId: 9001, idExterno: '001-P-AZUL', quantidade: 2, valor: 79.9 }]);

            expect(chamadas('AddToCart')[0][2]).toEqual({
                content_ids: ['001-P-AZUL'],
                content_type: 'product',
                value: 159.8,
                currency: 'BRL',
                contents: [{ id: '001-P-AZUL', quantity: 2, item_price: 79.9 }],
            });
            expect(dataSource.contentIds).not.toHaveBeenCalled(); // já tinha o idExterno: sem ida ao backend
        });

        it('sem idExterno, o content_id vem do backend (mesma regra do catálogo), nunca inventado aqui', async () => {
            dataSource.contentIds.and.returnValue(of({ ids: { '9002': 'SKU-002-DO-CATALOGO' } }));
            criar();
            await service.iniciar();
            await service.addToCart([{ produtoId: 9002, quantidade: 1, valor: 99.9 }]);

            expect(dataSource.contentIds).toHaveBeenCalledWith([9002]);
            expect(chamadas('AddToCart')[0][2].content_ids).toEqual(['SKU-002-DO-CATALOGO']);
        });

        it('se o backend não resolver o id, o item é omitido (não manda id diferente do catálogo)', async () => {
            dataSource.contentIds.and.returnValue(throwError(() => new Error('falhou')));
            criar();
            await service.iniciar();
            await service.addToCart([{ produtoId: 9002, quantidade: 1, valor: 99.9 }]);

            expect(chamadas('AddToCart').length).toBe(0);
        });
    });

    describe('InitiateCheckout', () => {
        it('envia content_ids, content_type, value, currency e num_items', async () => {
            dataSource.contentIds.and.returnValue(of({ ids: { '9001': 'SKU-001', '9002': 'SKU-002' } }));
            criar();
            await service.iniciar();
            await service.initiateCheckout([
                { produtoId: 9001, quantidade: 2, valor: 79.9 },
                { produtoId: 9002, quantidade: 1, valor: 99.9 },
            ]);

            const parametros = chamadas('InitiateCheckout')[0][2];
            expect(parametros.content_ids).toEqual(['SKU-001', 'SKU-002']);
            expect(parametros.content_type).toBe('product');
            expect(parametros.value).toBe(259.7);
            expect(parametros.currency).toBe('BRL');
            expect(parametros.num_items).toBe(3);
            expect(dataSource.contentIds).toHaveBeenCalledTimes(1); // 1 chamada pro carrinho todo
        });

        it('não repete a ida ao backend pro mesmo produto (cache)', async () => {
            dataSource.contentIds.and.returnValue(of({ ids: { '9001': 'SKU-001' } }));
            criar();
            await service.iniciar();
            await service.addToCart([{ produtoId: 9001, quantidade: 1, valor: 10 }]);
            await service.initiateCheckout([{ produtoId: 9001, quantidade: 1, valor: 10 }]);
            expect(dataSource.contentIds).toHaveBeenCalledTimes(1);
        });
    });

    describe('Purchase e event_id', () => {
        it('usa o eventID do backend (order_<id>) na opção do fbq e NÃO o repete nos parâmetros', async () => {
            criar();
            await service.iniciar();
            service.purchase(compraDoBackend());

            const [, , parametros, opcoes] = chamadas('Purchase')[0];
            expect(opcoes).toEqual({ eventID: 'order_123' });
            expect(parametros).toEqual({
                value: 259.7,
                currency: 'BRL',
                content_ids: ['SKU-001', 'SKU-002'],
                content_type: 'product',
                contents: compraDoBackend().contents,
                num_items: 3,
            });
            expect(parametros.eventId).toBeUndefined();
        });

        it('DEDUPLICAÇÃO: o eventID do Pixel é exatamente o event_id do CAPI (order_123), sem recalcular', async () => {
            const eventIdDoCapi = 'order_123'; // event_id que o backend envia na Conversions API
            criar();
            await service.iniciar();
            service.purchase(compraDoBackend({ eventId: eventIdDoCapi }));

            expect(chamadas('Purchase')[0][3].eventID).toBe(eventIdDoCapi);
        });

        it('recarregar a página não dispara o Purchase de novo no navegador', async () => {
            criar();
            await service.iniciar();
            service.purchase(compraDoBackend());
            service.purchase(compraDoBackend());

            expect(chamadas('Purchase').length).toBe(1);
        });

        it('pedidos diferentes têm eventIDs diferentes e ambos disparam', async () => {
            criar();
            await service.iniciar();
            service.purchase(compraDoBackend({ eventId: 'order_1' }));
            service.purchase(compraDoBackend({ eventId: 'order_2' }));

            expect(chamadas('Purchase').map((c) => c[3].eventID)).toEqual(['order_1', 'order_2']);
        });
    });

    describe('purchaseDoPedido (confirmação pelo backend)', () => {
        it('dispara o Purchase quando o BACKEND confirma o pedido pago', async () => {
            dataSource.purchase.and.returnValue(of(compraDoBackend()));
            criar();
            await service.iniciar();

            await service.purchaseDoPedido(123, 'token-do-pedido');

            expect(dataSource.purchase).toHaveBeenCalledWith(123, 'token-do-pedido');
            expect(chamadas('Purchase')[0][3]).toEqual({ eventID: 'order_123' });
        });

        it('NÃO dispara Purchase se o pedido não está elegível (cancelado, etc.)', async () => {
            dataSource.purchase.and.returnValue(of({ elegivel: false, motivo: 'PEDIDO_CANCELADO' }));
            criar();
            await service.iniciar();

            await service.purchaseDoPedido(123, 'token', { tentativas: 3, esperaMs: 0 });

            expect(chamadas('Purchase').length).toBe(0);
            expect(dataSource.purchase).toHaveBeenCalledTimes(1); // motivo definitivo: não insiste
        });

        it('pagamento ainda não confirmado (webhook atrasado): tenta de novo, com limite, e dispara quando confirmar', async () => {
            dataSource.purchase.and.returnValues(
                of({ elegivel: false, motivo: 'PAGAMENTO_NAO_CONFIRMADO' }),
                of({ elegivel: false, motivo: 'PAGAMENTO_NAO_CONFIRMADO' }),
                of(compraDoBackend()),
            );
            criar();
            await service.iniciar();

            await service.purchaseDoPedido(123, 'token', { tentativas: 4, esperaMs: 0 });

            expect(dataSource.purchase).toHaveBeenCalledTimes(3);
            expect(chamadas('Purchase').length).toBe(1);
        });

        it('nunca confirmado: para no limite de tentativas e não dispara', async () => {
            dataSource.purchase.and.returnValue(of({ elegivel: false, motivo: 'PAGAMENTO_NAO_CONFIRMADO' }));
            criar();
            await service.iniciar();

            await service.purchaseDoPedido(123, 'token', { tentativas: 3, esperaMs: 0 });

            expect(dataSource.purchase).toHaveBeenCalledTimes(3);
            expect(chamadas('Purchase').length).toBe(0);
        });

        it('token inválido (404 do backend) não quebra nem dispara', async () => {
            dataSource.purchase.and.returnValue(throwError(() => new Error('404')));
            criar();
            await service.iniciar();

            await expectAsync(service.purchaseDoPedido(123, 'errado')).toBeResolved();
            expect(chamadas('Purchase').length).toBe(0);
        });

        it('com o Pixel desabilitado não consulta o backend', async () => {
            dataSource.config.and.returnValue(of({ habilitado: false, pixelId: null }));
            criar();
            await service.iniciar();

            await service.purchaseDoPedido(123, 'token');

            expect(dataSource.purchase).not.toHaveBeenCalled();
        });
    });

    describe('Advanced Matching (usuário logado)', () => {
        const usuario = {
            id: 7,
            nome: 'Maria',
            sobrenome: 'da Silva',
            email: ' Maria@Exemplo.COM ',
            telefone: '(86) 99999-1234',
            dataNascimento: '1990-03-05',
        };

        it('anônimo: init só com o pixelId', async () => {
            criar();
            await service.iniciar();
            expect(fbq).toHaveBeenCalledWith('init', '555');
        });

        it('logado: init leva em, ph, fn, ln, db e external_id normalizados', async () => {
            localStorage.setItem('usuario_da_sessao', JSON.stringify(usuario));
            criar();
            await service.iniciar();

            expect(fbq).toHaveBeenCalledWith('init', '555', {
                em: 'maria@exemplo.com',
                ph: '5586999991234',
                fn: 'maria',
                ln: 'silva',
                db: '19900305',
                external_id: '7',
            });
        });

        it('login depois do init: atualizarUsuario reenvia o init com os dados', async () => {
            criar();
            await service.iniciar();
            localStorage.setItem('usuario_da_sessao', JSON.stringify(usuario));
            service.atualizarUsuario();

            expect(fbq.calls.allArgs().filter((a) => a[0] === 'init').length).toBe(2);
            expect(fbq.calls.mostRecent().args[2].em).toBe('maria@exemplo.com');
        });
    });

    describe('dados de rastreio (_fbp/_fbc) enviados ao checkout', () => {
        afterEach(() => {
            document.cookie = '_fbp=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            document.cookie = '_fbc=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        });

        it('devolve os cookies do Pixel quando existem', async () => {
            document.cookie = '_fbp=fb.1.1700000000.111; path=/';
            document.cookie = '_fbc=fb.1.1700000000.abc; path=/';
            criar();
            await service.iniciar();

            expect(service.dadosDeRastreio()).toEqual({ fbp: 'fb.1.1700000000.111', fbc: 'fb.1.1700000000.abc' });
        });

        it('sem cookies não envia nada', async () => {
            criar();
            await service.iniciar();
            expect(service.dadosDeRastreio()).toBeUndefined();
        });

        it('com o Pixel desabilitado não envia dados de rastreio', async () => {
            document.cookie = '_fbp=fb.1.1700000000.111; path=/';
            dataSource.config.and.returnValue(of({ habilitado: false, pixelId: null }));
            criar();
            await service.iniciar();

            expect(service.dadosDeRastreio()).toBeUndefined();
        });
    });
});
