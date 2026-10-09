import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LojaDataSource } from '../../../data/loja.data.source';
import { CarrinhoFacadeService } from '../../../../carrinho/services/carrinho.facade.service';
import { MetaPixelService } from '../../../../core/meta-pixel/meta-pixel.service';
import { AutenticacaoService } from '../../../../autenticacao/services/autenticacao.service';
import { LocalStorageService } from '../../../../core/local_storage/local-storage.service';
import { LojaHomePage } from './loja.home.page';

const ref = (id: number) => ({ id, referenciaId: id, nome: 'Peça ' + id, valor: 100, saldo: 2 });

describe('LojaHomePage', () => {
  function montar(vitrineHome: any) {
    const ds = jasmine.createSpyObj('LojaDataSource', {
      status: of({ aberto: true }),
      promocoesAtivas: of({ items: [], total: 0 }),
      formaPagamento: of([]),
      vitrineHome,
      vitrineMenu: of([]),
      listarReferencias: of({ items: [ref(99)], meta: { has_next_page: false } }),
    });
    TestBed.configureTestingModule({
      imports: [LojaHomePage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LojaDataSource, useValue: ds },
        { provide: CarrinhoFacadeService, useValue: { contarItens: async () => 0 } },
        { provide: AutenticacaoService, useValue: { estaAutenticado: () => false } },
        { provide: LocalStorageService, useValue: { get: () => null } },
        { provide: MetaPixelService, useValue: { addToCart: async () => { } } },
      ],
    });
    const fixture = TestBed.createComponent(LojaHomePage);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  async function renderizar(fixture: any) {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('renderiza as listas da vitrine antes dos produtos, sem rail de categorias', async () => {
    const { fixture, el } = montar(of([
      { id: 5, nome: 'Novidades', descricao: 'Recém chegadas', ordem: 0, referencias: [ref(1), ref(2)] },
      { id: 6, nome: 'Vazia', ordem: 1, referencias: [] },
    ]));
    await renderizar(fixture);
    const secoes = el.querySelectorAll('section.loja-lista');
    expect(secoes.length).toBe(1);
    expect(secoes[0].textContent).toContain('Novidades');
    expect(secoes[0].querySelector('a.loja-lista-ver-tudo')!.getAttribute('href')).toBe('/loja/lista/5');
    expect(secoes[0].querySelectorAll('produto-card').length).toBe(2);
    expect(el.querySelector('.loja-categorias')).toBeNull();
    const principal = el.querySelector('main#produtos')!;
    expect(secoes[0].compareDocumentPosition(principal) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(principal.querySelectorAll('produto-card').length).toBe(1);
  });

  it('erro na vitrine não derruba a home', async () => {
    const { fixture, el } = montar(throwError(() => new Error('x')));
    await renderizar(fixture);
    expect(el.querySelectorAll('section.loja-lista').length).toBe(0);
    expect(el.querySelectorAll('main#produtos produto-card').length).toBe(1);
  });
});
