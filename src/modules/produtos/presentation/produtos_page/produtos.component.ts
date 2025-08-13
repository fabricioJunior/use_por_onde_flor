import { Component, signal } from "@angular/core";
import { ProdutoService } from "../../services/produto.service";
import { MatInputModule } from "@angular/material/input";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatListModule } from '@angular/material/list';
import { ProdutoDto } from "../../data/dtos/produto.dto";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from '@angular/material/card';
import { debounceTime } from 'rxjs/operators';
@Component({
    selector: 'app-produtos',
    templateUrl: './produtos.component.html',
    styleUrls: ['./produtos.component.scss'],
    imports: [MatInputModule, MatCardModule, MatListModule, MatProgressSpinnerModule, ReactiveFormsModule]
})
export class ProdutosComponent {

    descricaoFromControl = new FormControl();
    loading = signal(false);

    produtos: ProdutoDto[] = [];

    constructor(private produtoService: ProdutoService) {
        this.descricaoFromControl.statusChanges.pipe(debounceTime(300)).subscribe((value) => {
            this.onDescricaoChange();
        });
    }

    async onDescricaoChange() {
        this.loading.set(true);
        this.produtos = await this.produtoService.recuperarProdutos(this.descricaoFromControl.value);
        console.log(this.produtos);
        this.loading.set(false);
    }

}