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
