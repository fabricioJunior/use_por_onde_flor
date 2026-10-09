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
  async function montar(referencias: any) {
    const ds = jasmine.createSpyObj('LojaDataSource', {
      status: of({ aberto: true }),
      promocoesAtivas: of({ items: [], total: 0 }),
      formaPagamento: of([]),
      vitrineMenu: of([{ tipo: 'grupo', id: 9, nome: 'G', ordem: 0, listas: [{ id: 4, nome: 'Vestidos', descricao: 'Leves', ordem: 0 }] }]),
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
    expect(ds.listarReferenciasDaLista).toHaveBeenCalledWith('4', 1, 24);
    expect(el.querySelector('h1')!.textContent).toContain('Vestidos');
    expect(el.textContent).toContain('Leves');
    expect(el.querySelectorAll('produto-card').length).toBe(2);
    expect(el.textContent).toContain('Ver mais produtos');
  });

  it('404 mostra "lista não encontrada" com link para a loja', async () => {
    const { el } = await montar(throwError(() => new HttpErrorResponse({ status: 404 })));
    expect(el.textContent).toContain('Lista não encontrada');
    expect(el.querySelector('.lista-nao-encontrada a')!.getAttribute('href')).toBe('/loja');
  });

  it('lista vazia mostra mensagem', async () => {
    const { el } = await montar(of({ items: [], meta: { has_next_page: false } }));
    expect(el.textContent).toContain('Ainda não há peças nesta lista');
  });
});
