import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BannerDataSource } from '../../../data/banner.data.source';
import { BannerDto } from '../../../data/dtos/banner.dto';
import { HeroComponent } from './hero.component';

function banner(id: number, dispositivo: 'desktop' | 'mobile', ordem: number): BannerDto {
    return {
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
