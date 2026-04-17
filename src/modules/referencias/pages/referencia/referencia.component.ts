import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ReferenciaDto, ReferenciaMidiaDto } from "../../data/referencia.data.source";
import { ReferenciaService } from "../../services/referencia.service";

@Component({
    selector: 'referencia-page',
    templateUrl: './referencia.component.html',
    styleUrls: ['./referencia.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
})
export class ReferenciaComponent implements OnInit {
    loading = signal(true);
    errorMessage = signal('');
    referencia = signal<ReferenciaDto | null>(null);
    midias = signal<ReferenciaMidiaDto[]>([]);
    fotoSelecionada = signal<ReferenciaMidiaDto | null>(null);
    midiasComErro = signal<Record<number, boolean>>({});
    private touchStartX: number | null = null;
    private readonly swipeThreshold = 40;

    constructor(
        private route: ActivatedRoute,
        private referenciaService: ReferenciaService,
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(async (params) => {
            const referenciaParam = params.get('referencia') ?? params.get('id') ?? '';
            await this.carregarReferencia(referenciaParam);
        });
    }

    async carregarReferencia(referenciaId: string) {
        this.loading.set(true);
        this.errorMessage.set('');

        if (!referenciaId) {
            this.referencia.set(null);
            this.midias.set([]);
            this.fotoSelecionada.set(null);
            this.errorMessage.set('Nenhuma referência foi informada.');
            this.loading.set(false);
            return;
        }

        try {
            const response = await this.referenciaService.carregarReferenciaPublica(referenciaId);
            this.midiasComErro.set({});
            this.referencia.set(response.referencia);
            this.midias.set(response.midias);
            this.fotoSelecionada.set(response.midias.find((midia) => midia.isDefault) ?? response.midias[0] ?? null);
        } catch (error) {
            console.error(error);
            this.referencia.set(null);
            this.midias.set([]);
            this.fotoSelecionada.set(null);
            this.errorMessage.set('Não foi possível carregar esta referência no momento.');
        } finally {
            this.loading.set(false);
        }
    }

    selecionarMidia(midia: ReferenciaMidiaDto) {
        this.fotoSelecionada.set(midia);
    }

    onTouchStart(event: TouchEvent) {
        this.touchStartX = event.touches[0]?.clientX ?? null;
    }

    onTouchEnd(event: TouchEvent) {
        if (this.touchStartX == null) {
            return;
        }

        const touchEndX = event.changedTouches[0]?.clientX ?? this.touchStartX;
        const deltaX = touchEndX - this.touchStartX;
        this.touchStartX = null;

        if (Math.abs(deltaX) < this.swipeThreshold) {
            return;
        }

        if (deltaX < 0) {
            this.irParaProximaImagem();
            return;
        }

        this.irParaImagemAnterior();
    }

    irParaProximaImagem() {
        const midias = this.midias();
        const atual = this.fotoSelecionada();

        if (!midias.length || !atual) {
            return;
        }

        const indiceAtual = midias.findIndex((item) => item.id === atual.id);
        const proximoIndice = indiceAtual >= 0 ? (indiceAtual + 1) % midias.length : 0;
        this.fotoSelecionada.set(midias[proximoIndice]);
    }

    irParaImagemAnterior() {
        const midias = this.midias();
        const atual = this.fotoSelecionada();

        if (!midias.length || !atual) {
            return;
        }

        const indiceAtual = midias.findIndex((item) => item.id === atual.id);
        const indiceAnterior = indiceAtual > 0 ? indiceAtual - 1 : midias.length - 1;
        this.fotoSelecionada.set(midias[indiceAnterior]);
    }

    onErroCarregarMidia(midia: ReferenciaMidiaDto | null) {
        if (!midia?.id) {
            return;
        }

        this.midiasComErro.update((estadoAtual) => ({
            ...estadoAtual,
            [midia.id]: true,
        }));

        if (this.fotoSelecionada()?.id === midia.id) {
            const proximaMidiaValida = this.midias().find((item) => item.id !== midia.id && !this.imagemIndisponivel(item));
            this.fotoSelecionada.set(proximaMidiaValida ?? null);
        }
    }

    imagemIndisponivel(midia: ReferenciaMidiaDto | null): boolean {
        if (!midia?.url) {
            return true;
        }

        return !!this.midiasComErro()[midia.id];
    }

    recuperarTituloDaImagem(midia: ReferenciaMidiaDto | null): string {
        if (midia?.description && midia.description.trim() !== '') {
            return midia.description;
        }

        return this.referencia()?.nome ?? 'Imagem da referência';
    }

    recuperarIniciais(): string {
        const nome = this.referencia()?.nome?.trim() ?? 'R';
        return nome.slice(0, 2).toUpperCase();
    }
}
