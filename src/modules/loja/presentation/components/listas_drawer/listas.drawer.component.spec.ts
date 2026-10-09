import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LojaDataSource } from '../../../data/loja.data.source';
import { VitrineMenuItemDto } from '../../../data/dtos/lista-catalogo.dto';
import { ListasDrawerComponent } from './listas.drawer.component';

const MENU: VitrineMenuItemDto[] = [
  { tipo: 'lista', id: 1, nome: 'Lançamentos', ordem: 0, icone: 'http://x/i.png' },
  { tipo: 'grupo', id: 7, nome: 'Verão', ordem: 1, listas: [{ id: 2, nome: 'Vestidos', ordem: 0 }, { id: 3, nome: 'Saias', ordem: 1 }] },
];

describe('ListasDrawerComponent', () => {
  function montar(vitrineMenu: () => any) {
    const ds = jasmine.createSpyObj('LojaDataSource', { vitrineMenu: vitrineMenu() });
    TestBed.configureTestingModule({
      imports: [ListasDrawerComponent],
      providers: [provideRouter([]), { provide: LojaDataSource, useValue: ds }],
    });
    const fixture = TestBed.createComponent(ListasDrawerComponent);
    fixture.componentRef.setInput('aberto', true);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, ds };
  }

  it('lista na ordem da API, com link para /loja/lista/:id e grupo recolhido', async () => {
    const { fixture, el } = montar(() => of(MENU));
    await fixture.whenStable();
    fixture.detectChanges();
    const link = el.querySelector('a.listas-drawer-item') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/loja/lista/1');
    expect(link.textContent).toContain('Lançamentos');
    const grupo = el.querySelector('button.listas-drawer-grupo') as HTMLButtonElement;
    expect(grupo.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelectorAll('a.listas-drawer-item').length).toBe(1);
  });

  it('grupo abre e fecha mostrando as listas dele', async () => {
    const { fixture, el } = montar(() => of(MENU));
    await fixture.whenStable();
    fixture.detectChanges();
    const grupo = el.querySelector('button.listas-drawer-grupo') as HTMLButtonElement;
    grupo.click();
    fixture.detectChanges();
    expect(grupo.getAttribute('aria-expanded')).toBe('true');
    const hrefs = Array.from(el.querySelectorAll('.listas-drawer-sub a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/loja/lista/2', '/loja/lista/3']);
    grupo.click();
    fixture.detectChanges();
    expect(el.querySelector('.listas-drawer-sub')).toBeNull();
  });

  it('mostra estado de erro e vazio', async () => {
    const erro = montar(() => throwError(() => new Error('x')));
    await erro.fixture.whenStable();
    erro.fixture.detectChanges();
    expect(erro.el.textContent).toContain('Não foi possível carregar o menu');
    TestBed.resetTestingModule();
    const vazio = montar(() => of([]));
    await vazio.fixture.whenStable();
    vazio.fixture.detectChanges();
    expect(vazio.el.textContent).toContain('Nenhuma lista disponível');
  });
});
