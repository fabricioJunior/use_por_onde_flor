import { Component, inject, signal } from "@angular/core";
import { ProdutoService } from "../../services/produto.service";
import { MatInputModule } from "@angular/material/input";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatListModule } from '@angular/material/list';
import { ProdutoDto } from "../../data/dtos/produto.dto";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from '@angular/material/card';
import { debounceTime } from 'rxjs/operators';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { FiltroTamanhoCorModal } from "../filtro_tamanho_cor_modal/filtro.tamanho.cor.modal";
@Component({
    selector: 'app-produtos',
    templateUrl: './produtos.component.html',
    styleUrls: ['./produtos.component.scss'],
    imports: [MatInputModule, MatCardModule, MatListModule, MatProgressSpinnerModule, ReactiveFormsModule, MatIconModule, MatButtonModule]
})
export class ProdutosComponent {

    descricaoFromControl = new FormControl();
    loading = signal(false);

    produtos: ProdutoDto[] = [];
    tamanhosSelecionados: string[] = [];
    coresSelecionadas: string[] = [];

    private _bottomSheet = inject(MatBottomSheet);

    constructor(private produtoService: ProdutoService) {
        this.descricaoFromControl.statusChanges.pipe(debounceTime(500)).subscribe((value) => {
            this.onDescricaoChange();
        });
    }

    async onDescricaoChange() {
        this.loading.set(true);
        this.produtos = await this.produtoService.recuperarProdutos(this.descricaoFromControl.value, this.tamanhosSelecionados, this.coresSelecionadas,);
        console.log(this.produtos);
        this.loading.set(false);
    }
    async onTapFilter() {
        const bottomSheetRef = this._bottomSheet.open(FiltroTamanhoCorModal,
            {
                data: {
                    coresSelecionadas: this.coresSelecionadas,
                    tamanhosSelecionados: this.tamanhosSelecionados
                }
            }
        );
        bottomSheetRef.afterDismissed().subscribe((result) => {
            console.log(result);
            this.coresSelecionadas = result.coresSelecionadas ?? [];
            this.tamanhosSelecionados = result.tamanhoSelecionados ?? [];

            this.onDescricaoChange();
        });
    }

}