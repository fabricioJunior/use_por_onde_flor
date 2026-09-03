import { Component, OnInit, signal } from "@angular/core";
import { CruzamentoTamanhoCorView, ProdutoService } from "../../services/produto.service";
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'app-produtos',
    templateUrl: './produto.component.html',
    styleUrls: ['./produto.component.scss'],
    imports: [MatTableModule, CommonModule, RouterLink, MatIconModule],
})
export class ProdutoComponent implements OnInit {

    produtoName: string = '';
    produtoPrice: number = 0;
    displayedColumns: string[] = [];
    dataSource: CruzamentoTamanhoCorView | null = null;
    referenciaAtual: string = '';
    loading = signal(true);
    linkCopiado = signal(false);

    constructor(
        private produtoService: ProdutoService,
        private route: ActivatedRoute,
    ) { }


    async ngOnInit() {
        this.referenciaAtual = this.route.snapshot.paramMap.get('referencia') ?? '';
        this.dataSource = await this.produtoService.recuperarCruzamentoTamanhoCor(this.referenciaAtual);
        this.loading.set(false);

    }

    get linkDaReferencia(): string {
        return `/referencias/${this.referenciaAtual}`;
    }

    async copiarLinkDaReferencia() {
        if (!this.referenciaAtual || typeof window === 'undefined') {
            return;
        }

        const linkCompleto = `${window.location.origin}${this.linkDaReferencia}`;

        try {
            await navigator.clipboard.writeText(linkCompleto);
            this.linkCopiado.set(true);
            window.setTimeout(() => this.linkCopiado.set(false), 2500);
        } catch (error) {
            console.error('Erro ao copiar link da referência', error);
        }
    }
}