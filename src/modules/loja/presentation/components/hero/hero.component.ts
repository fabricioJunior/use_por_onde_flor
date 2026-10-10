import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { BannerDataSource } from "../../../data/banner.data.source";
import { BannerDto } from "../../../data/dtos/banner.dto";

const TROCA_AUTOMATICA_MS = 6000;
const LIMIAR_SWIPE_PX = 50;

/// Um slide = a foto horizontal do desktop e a vertical do mobile, pareadas por `ordem`.
/// `<picture>` troca a fonte no breakpoint, então existe um só elemento por slide.
interface HeroSlide {
    id: number;
    desktop: string;
    mobile: string;
    video: boolean;
    /// Destino ao tocar no banner; `null` = banner sem link.
    href: string | null;
    /// Rota do próprio site: navega pelo router, sem recarregar a página.
    interno: boolean;
}

// Banner de foto em tela cheia (handoff "Banner da home com fotos de celular"): ocupa o que sobra
// da viewport abaixo do topo, crossfade de .7s e troca a cada 6s. As fotos vêm do admin
// (`GET /e-commerce/:id/banners`), cadastradas por dispositivo.
//
// ponytail: o banner não tem kicker, título nem CTA porque `EcommerceBannerEntity` só guarda
// url/ordem/ativo/dispositivo -- sem campo de texto no backend, o bloco de texto sobre a foto (e o
// gradiente que existe só para legibilizá-lo) ficam de fora. Quando a entidade ganhar
// kicker/titulo/cta/alt, montar a sobreposição descrita no handoff.
@Component({
    selector: 'loja-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit, OnDestroy {
    slides = signal<HeroSlide[]>([]);
    indice = signal(0);

    private timer?: ReturnType<typeof setInterval>;
    private pausado = false;
    private arrastoX: number | null = null;
    private arrastou = false;

    constructor(private bannerDataSource: BannerDataSource, private router: Router) { }

    ngOnInit(): void {
        this.bannerDataSource.listar().subscribe({
            next: (banners) => {
                const ativos = banners.filter((b) => b.ativo).sort((a, b) => a.ordem - b.ordem);
                const desktop = ativos.filter((b) => b.dispositivo === 'desktop');
                const mobile = ativos.filter((b) => b.dispositivo === 'mobile');
                // Loja que ainda não cadastrou a versão vertical cai na horizontal, em vez de
                // ficar sem banner no celular.
                this.slides.set(desktop.map((b, i) => this.slide(b, mobile[i] ?? b)));
                this.reiniciar();
            },
            // Falha de rede não pode derrubar a home -- a seção simplesmente não aparece.
            error: (error) => console.error('Erro ao carregar banners', error),
        });
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
    }

    private slide(desktop: BannerDto, mobile: BannerDto): HeroSlide {
        const href = this.destino(desktop);
        return {
            id: desktop.id,
            desktop: desktop.url,
            mobile: mobile.url,
            video: desktop.type === 'Vídeo',
            href,
            interno: !!href && href.startsWith('/'),
        };
    }

    // O link é do banner desktop: é ele que define o slide (o mobile é só a outra foto).
    private destino(banner: BannerDto): string | null {
        if (banner.linkTipo === 'lista' && banner.listaId) {
            return `/loja/lista/${banner.listaId}`;
        }
        if (banner.linkTipo === 'url' && banner.linkUrl?.trim()) {
            return banner.linkUrl.trim();
        }
        return null;
    }

    // Arrastar para passar a foto não pode virar clique no link.
    aoClicar(evento: MouseEvent, slide: HeroSlide): void {
        if (this.arrastou) {
            evento.preventDefault();
            return;
        }
        if (slide.interno && slide.href) {
            evento.preventDefault();
            void this.router.navigateByUrl(slide.href);
        }
    }

    get total(): number {
        return this.slides().length;
    }

    get pilulas(): number[] {
        return Array.from({ length: this.total }, (_, i) => i);
    }

    ir(indice: number): void {
        this.indice.set(indice);
        this.reiniciar();
    }

    passar(direcao: 1 | -1): void {
        const total = this.total;
        if (total) {
            this.indice.update((i) => (i + direcao + total) % total);
        }
        this.reiniciar();
    }

    // Quem está lendo o banner não quer que ele troque sozinho no meio.
    pausar(): void {
        this.pausado = true;
        clearInterval(this.timer);
    }

    retomar(): void {
        this.pausado = false;
        this.reiniciar();
    }

    onPointerDown(event: PointerEvent): void {
        this.arrastoX = event.clientX;
        this.arrastou = false;
        this.pausar();
    }

    onPointerUp(event: PointerEvent): void {
        const inicio = this.arrastoX;
        this.arrastoX = null;
        if (inicio !== null) {
            const deltaX = event.clientX - inicio;
            this.arrastou = Math.abs(deltaX) > LIMIAR_SWIPE_PX;
            if (this.arrastou) {
                this.passar(deltaX < 0 ? 1 : -1);
            }
        }
        this.retomar();
    }

    private reiniciar(): void {
        clearInterval(this.timer);
        if (this.total < 2 || this.pausado || this.animacaoReduzida()) {
            return;
        }
        this.timer = setInterval(() => this.indice.update((i) => (i + 1) % this.total), TROCA_AUTOMATICA_MS);
    }

    // Sem `window` no SSR; quem pediu menos movimento troca a foto só no toque ou na seta.
    private animacaoReduzida(): boolean {
        return typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
}
