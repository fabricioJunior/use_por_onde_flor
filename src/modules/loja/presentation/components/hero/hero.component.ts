import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { BannerDataSource } from "../../../data/banner.data.source";
import { BannerDto } from "../../../data/dtos/banner.dto";

const TROCA_AUTOMATICA_MS = 5500;

// Fallback estático -- exibido só se a API não retornar nenhum banner ativo pro
// e-commerce (ex: loja recém-criada, nenhum banner cadastrado ainda).
const BANNER_PADRAO: BannerDto = {
    id: 0,
    ecommerceId: 0,
    type: 'Imagem',
    url: '/imagens/imagem-principal.jpg',
    ordem: 0,
    ativo: true,
};

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

    ngOnInit(): void {
        this.bannerDataSource.listar().subscribe({
            next: (banners) => {
                if (banners.length > 0) {
                    this.banners = banners;
                    this.bannerIndex.set(0);
                }
                this.reiniciarAutoplay();
            },
            // Falha de rede não pode derrubar o hero -- mantém o fallback estático.
            error: () => this.reiniciarAutoplay(),
        });
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
