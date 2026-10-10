import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BannerDataSource } from '../../../data/banner.data.source';
import { BannerDto } from '../../../data/dtos/banner.dto';
import { HeroComponent } from './hero.component';

function banner(
    id: number,
    dispositivo: 'desktop' | 'mobile',
    ordem: number,
    link?: Partial<BannerDto>,
): BannerDto {
    return {
        ...link,
        id,
        ecommerceId: 1,
        type: 'Imagem',
        url: `${dispositivo}-${ordem}.webp`,
        ordem,
        ativo: true,
        dispositivo,
    };
}

function montar(banners: BannerDto[]): HeroComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        imports: [HeroComponent],
        providers: [{ provide: BannerDataSource, useValue: { listar: () => of(banners) } }],
    });
    const fixture = TestBed.createComponent(HeroComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
}

describe('HeroComponent', () => {
    it('lista vira rota interna do site e url fica como está', () => {
        const hero = montar([
            banner(1, 'desktop', 1, { linkTipo: 'lista', listaId: 9 }),
            banner(2, 'desktop', 2, { linkTipo: 'url', linkUrl: 'https://instagram.com/x' }),
            banner(3, 'desktop', 3, { linkTipo: 'url', linkUrl: '/loja?q=jeans' }),
            banner(4, 'desktop', 4),
        ]);
        expect(hero.slides().map((s) => s.href)).toEqual([
            '/loja/lista/9',
            'https://instagram.com/x',
            '/loja?q=jeans',
            null,
        ]);
    });

    it('no celular vale o link do banner vertical', () => {
        const hero = montar([
            banner(1, 'desktop', 1, { linkTipo: 'lista', listaId: 9 }),
            banner(2, 'mobile', 1, { linkTipo: 'url', linkUrl: '/loja?q=jeans' }),
        ]);
        const slide = hero.slides()[0];
        hero.telaMobile.set(false);
        expect(hero.destinoDoSlide(slide)).toBe('/loja/lista/9');
        hero.telaMobile.set(true);
        expect(hero.destinoDoSlide(slide)).toBe('/loja?q=jeans');
    });

    it('só o slide visível recebe clique (senão abre sempre o link do último banner)', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [HeroComponent],
            providers: [{
                provide: BannerDataSource, useValue: {
                    listar: () => of([
                        banner(1, 'desktop', 1, { linkTipo: 'lista', listaId: 19 }),
                        banner(2, 'desktop', 2, { linkTipo: 'lista', listaId: 20 }),
                    ]),
                },
            }],
        });
        const fixture = TestBed.createComponent(HeroComponent);
        fixture.detectChanges();
        const slides: HTMLElement[] = Array.from(
            fixture.nativeElement.querySelectorAll('.hero-slide'),
        );
        expect(slides.length).toBe(2);
        expect(slides[0].classList).toContain('ativo');
        expect(slides[1].classList).not.toContain('ativo');
        expect(getComputedStyle(slides[1]).pointerEvents).toBe('none');
    });

    it('arrastar para passar a foto não dispara o link', () => {
        const hero = montar([
            banner(1, 'desktop', 1, { linkTipo: 'lista', listaId: 9 }),
            banner(2, 'desktop', 2),
        ]);
        const slide = hero.slides()[0];

        hero.onPointerDown({ clientX: 300 } as PointerEvent);
        hero.onPointerUp({ clientX: 100 } as PointerEvent);
        const arrasto = jasmine.createSpyObj<MouseEvent>('evento', ['preventDefault']);
        hero.aoClicar(arrasto, slide);
        expect(arrasto.preventDefault).toHaveBeenCalled();

        // Toque sem arrasto: o link interno navega pelo router, sem recarregar a página.
        hero.onPointerDown({ clientX: 300 } as PointerEvent);
        hero.onPointerUp({ clientX: 298 } as PointerEvent);
        const toque = jasmine.createSpyObj<MouseEvent>('evento', ['preventDefault']);
        hero.aoClicar(toque, slide);
        expect(toque.preventDefault).toHaveBeenCalled();
    });

    it('pareia a foto horizontal com a vertical pela ordem', () => {
        const hero = montar([
            banner(2, 'mobile', 2),
            banner(1, 'desktop', 1),
            banner(3, 'desktop', 2),
            banner(4, 'mobile', 1),
        ]);
        expect(hero.slides().map((s) => [s.desktop, s.mobile])).toEqual([
            ['desktop-1.webp', 'mobile-1.webp'],
            ['desktop-2.webp', 'mobile-2.webp'],
        ]);
    });

    it('sem foto vertical cadastrada, o celular usa a horizontal', () => {
        const hero = montar([banner(1, 'desktop', 1)]);
        expect(hero.slides()).toEqual([
            jasmine.objectContaining({ desktop: 'desktop-1.webp', mobile: 'desktop-1.webp' }),
        ]);
    });

    it('banner inativo não vira slide', () => {
        const hero = montar([{ ...banner(1, 'desktop', 1), ativo: false }, banner(2, 'desktop', 2)]);
        expect(hero.total).toBe(1);
        expect(hero.slides()[0].desktop).toBe('desktop-2.webp');
    });
});
