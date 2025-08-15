import { Component, Inject, OnInit, signal } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ProdutoService } from "../../services/produto.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTreeModule } from '@angular/material/tree';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatList, MatListModule } from "@angular/material/list";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { FilledButtonComponent } from "../../../core/common_components/filled.button.component";

@Component({
    selector: 'filtro-tamanho-cor',
    templateUrl: './filtro.tamanho.cor.modal.html',
    styleUrls: [
        './filtro.tamanho.cor.modal.scss'
    ],
    imports: [MatProgressSpinnerModule, MatTreeModule, MatExpansionModule, MatListModule, MatCheckboxModule, MatButtonModule, MatDividerModule, MatIconModule]
})
export class FiltroTamanhoCorModal implements OnInit {
    loading = signal(true);

    tamanhos: string[] = [];
    cores: string[] = [];
    tamanhosSelecionados: string[] = [];
    coresSelecionadas: string[] = [];

    constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { tamanhosSelecionados: string[], coresSelecionadas: string[] }, private bottomSheetRef: MatBottomSheetRef<FiltroTamanhoCorModal>, private produtoService: ProdutoService) {
        console.log(this.tamanhosSelecionados);
        this.tamanhosSelecionados = data.tamanhosSelecionados ?? [];
        this.coresSelecionadas = data.coresSelecionadas ?? [];
    }

    async ngOnInit() {
        this.tamanhos = await this.produtoService.recuperarTamanhos();
        this.cores = await this.produtoService.recuperarCores();
        this.loading.set(false);
    }
    onUnseletClick() {
        this.bottomSheetRef.dismiss({
            tamanhoSelecionados: [],
            coresSelecionadas: []
        });
    }

    tamanhoStatusChecked(checked: boolean, tamanho: string) {

        if (checked) {
            this.tamanhosSelecionados.push(tamanho);
        } else {
            const indexToRemove = this.tamanhosSelecionados.indexOf(tamanho);
            if (indexToRemove > -1) { // Check if the element exists
                this.tamanhosSelecionados.splice(indexToRemove, 1);
            }
        }

    }

    corStatusChecked(checked: boolean, cor: string) {

        if (checked) {
            this.coresSelecionadas.push(cor);
        } else {
            const indexToRemove = this.coresSelecionadas.indexOf(cor);
            if (indexToRemove > -1) { // Check if the element exists
                this.coresSelecionadas.splice(indexToRemove, 1);
            }
        }

    }

    confirmarButtonClick() {
        this.bottomSheetRef.dismiss({
            tamanhoSelecionados: this.tamanhosSelecionados,
            coresSelecionadas: this.coresSelecionadas
        });
    }
}


export class FiltroTamanhoCorResult {
    tamanhos?: string[];
    cores?: string[];
}