import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { BannerDataSource } from "../../../data/banner.data.source";
import { BannerDto } from "../../../data/dtos/banner.dto";

const TROCA_AUTOMATICA_MS = 5500;

// Fallback estático -- exibido só se a API não retornar nenhum banner ativo pro
// e-commerce (ex: loja recém-criada, nenhum banner cadastrado ainda). Imagem em
// branco de propósito: imagem-principal.jpg era uma campanha específica, não faz
// sentido reaparecer como "padrão" genérico pra lojas sem banner configurado.
const BANNER_PADRAO: BannerDto = {
    id: 0,
    ecommerceId: 0,
    type: 'Imagem',
    url: '/imagens/imagem-em-branco.jpg',
    ordem: 0,
    ativo: true,
    dispositivo: 'desktop',
};

// Mesmo breakpoint do CSS (media max-width: 760px) -- abaixo disso o hero troca
// pro layout mobile, então os banners também precisam trocar.
const BREAKPOINT_MOBILE = '(max-width: 760px)';

// Porta Angular de `desing system/ui_kits/site/Hero.jsx`.
@Component({
    selector: 'loja-hero',
    standalone: true,
    imports: [CommonModule, RouterLink, TracoComponent, LogoComponent],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit, OnDestroy {
    // Carrossel simples de até 3 banners (crossfade + bolinhas), vindo da API
    // (gerenciado pelo app siv_front). Bolinhas somem sozinhas quando há só 1.
    banners: BannerDto[] = [BANNER_PADRAO];
    bannerIndex = signal(0);
    private timer?: ReturnType<typeof setInterval>;

    constructor(private bannerDataSource: BannerDataSource) {}

    private todosBanners: BannerDto[] = [];

    ngOnInit(): void {
        this.bannerDataSource.listar().subscribe({
            next: (banners) => {
                if (banners.length > 0) {
                    this.todosBanners = banners;
                    this.aplicarBannersPorDispositivo();
                }
                this.reiniciarAutoplay();
            },
            // Falha de rede não pode derrubar o hero -- mantém o fallback estático.
            error: () => this.reiniciarAutoplay(),
        });
    }

    // Loja pode não ter cadastrado banner mobile ainda -- cai pro desktop nesse
    // caso, em vez de mostrar hero vazio.
    private aplicarBannersPorDispositivo(): void {
        const mobile = window.matchMedia(BREAKPOINT_MOBILE).matches;
        const doDispositivo = this.todosBanners.filter(
            (b) => b.dispositivo === (mobile ? 'mobile' : 'desktop'),
        );
        this.banners = doDispositivo.length > 0
            ? doDispositivo
            : this.todosBanners.filter((b) => b.dispositivo === 'desktop');
        this.bannerIndex.set(0);
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
    }

    selecionarBanner(indice: number): void {
        this.bannerIndex.set(indice);
    }

    private reiniciarAutoplay(): void {
        clearInterval(this.timer);
        if (this.banners.length < 2) return;
        this.timer = setInterval(() => {
            this.bannerIndex.update((i) => (i + 1) % this.banners.length);
        }, TROCA_AUTOMATICA_MS);
    }
}
