import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LojaDataSource } from '../../../data/loja.data.source';
import { CarrinhoFacadeService } from '../../../../carrinho/services/carrinho.facade.service';
import { MetaPixelService } from '../../../../core/meta-pixel/meta-pixel.service';
import { AutenticacaoService } from '../../../../autenticacao/services/autenticacao.service';
import { LocalStorageService } from '../../../../core/local_storage/local-storage.service';
import { LojaListaPage } from './loja.lista.page';

const ref = (id: number) => ({ id, referenciaId: id, nome: 'Peça ' + id, valor: 100, saldo: 2 });

describe('LojaListaPage', () => {
  const DETALHE = { id: 4, nome: 'Vestidos', descricao: 'Leves', icone: null, tipo: 'catalogo', modo: 'manual' };
  const e404 = () => throwError(() => new HttpErrorResponse({ status: 404 }));

  async function montar(referencias: any, detalhe: any = of(DETALHE)) {
    const ds = jasmine.createSpyObj('LojaDataSource', {
      status: of({ aberto: true }),
      promocoesAtivas: of({ items: [], total: 0 }),
      formaPagamento: of([]),
      vitrineMenu: of([]),
      detalheLista: detalhe,
      listarReferenciasDaLista: referencias,
    });
    TestBed.configureTestingModule({
      imports: [LojaListaPage],
      providers: [
        provideRouter([{ path: 'loja/lista/:id', component: LojaListaPage }]),
        { provide: LojaDataSource, useValue: ds },
        { provide: CarrinhoFacadeService, useValue: { contarItens: async () => 0 } },
        { provide: AutenticacaoService, useValue: { estaAutenticado: () => false } },
        { provide: LocalStorageService, useValue: { get: () => null } },
        { provide: MetaPixelService, useValue: { addToCart: async () => { } } },
      ],
    });
    const { RouterTestingHarness } = await import('@angular/router/testing');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/loja/lista/4', LojaListaPage);
    await harness.fixture.whenStable();
    harness.detectChanges();
    return { ds, el: harness.routeNativeElement as HTMLElement };
  }

  it('mostra título/descrição da lista e o grid de produtos', async () => {
    const { ds, el } = await montar(of({ items: [ref(1), ref(2)], meta: { has_next_page: true } }));
    expect(ds.detalheLista).toHaveBeenCalledWith('4');
    expect(ds.listarReferenciasDaLista).toHaveBeenCalledWith('4', 1, 24, undefined);
    expect(el.querySelector('h1')!.textContent).toContain('Vestidos');
    expect(el.textContent).toContain('Leves');
    expect(el.querySelectorAll('produto-card').length).toBe(2);
    expect(el.textContent).toContain('Ver mais produtos');
  });

  it('404 do detalhe mostra "lista não encontrada"', async () => {
    const { el } = await montar(of({ items: [], meta: { has_next_page: false } }), e404());
    expect(el.textContent).toContain('Lista não encontrada');
  });

  it('erro no detalhe mostra os produtos sem cabeçalho', async () => {
    const { el } = await montar(of({ items: [ref(1)], meta: { has_next_page: false } }), throwError(() => new HttpErrorResponse({ status: 500 })));
    expect(el.querySelector('h1')).toBeNull();
    expect(el.querySelectorAll('produto-card').length).toBe(1);
  });

  it('404 das referências mostra "lista não encontrada" com link para a loja', async () => {
    const { el } = await montar(e404());
    expect(el.textContent).toContain('Lista não encontrada');
    expect(el.querySelector('.lista-nao-encontrada a')!.getAttribute('href')).toBe('/loja');
  });

  it('lista vazia mostra mensagem', async () => {
    const { el } = await montar(of({ items: [], meta: { has_next_page: false } }));
    expect(el.textContent).toContain('Ainda não há peças nesta lista');
  });
});
