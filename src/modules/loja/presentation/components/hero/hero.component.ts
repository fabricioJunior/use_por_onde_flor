import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { BannerDataSource } from "../../../data/banner.data.source";
import { BannerDto } from "../../../data/dtos/banner.dto";

const TROCA_AUTOMATICA_MS = 6000;

// Carrossel de banners (README 1.4): 20:7 no desktop, 3:2 no mobile, crossfade de .7s, troca a cada
// 6s. Os banners vêm do admin (`GET /e-commerce/:id/banners`), cada um já cadastrado por
// dispositivo -- os dois conjuntos são renderizados e o CSS mostra o do breakpoint atual, pra não
// depender de JS de resize (SSR).
@Component({
    selector: 'loja-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit, OnDestroy {
    desktop = signal<BannerDto[]>([]);
    mobile = signal<BannerDto[]>([]);
    indice = signal(0);

    private timer?: ReturnType<typeof setInterval>;

    constructor(private bannerDataSource: BannerDataSource) { }

    ngOnInit(): void {
        this.bannerDataSource.listar().subscribe({
            next: (banners) => {
                const ativos = banners.filter((b) => b.ativo).sort((a, b) => a.ordem - b.ordem);
                const desktop = ativos.filter((b) => b.dispositivo === 'desktop');
                this.desktop.set(desktop);
                // Loja que ainda não cadastrou banner mobile cai no desktop em vez de ficar vazia.
                this.mobile.set(ativos.filter((b) => b.dispositivo === 'mobile').length
                    ? ativos.filter((b) => b.dispositivo === 'mobile')
                    : desktop);
                this.reiniciar();
            },
            // Falha de rede não pode derrubar a home -- a seção simplesmente não aparece.
            error: (error) => console.error('Erro ao carregar banners', error),
        });
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
    }

    get total(): number {
        return Math.max(this.desktop().length, this.mobile().length);
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

    private reiniciar(): void {
        clearInterval(this.timer);
        if (this.total < 2) {
            return;
        }
        this.timer = setInterval(() => this.indice.update((i) => (i + 1) % this.total), TROCA_AUTOMATICA_MS);
    }
}
