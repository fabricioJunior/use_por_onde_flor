import { Component, OnInit, signal } from "@angular/core";
import { CruzamentoTamanhoCorView, ProdutoService } from "../../services/produto.service";
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from "@angular/common";

import { ActivatedRoute } from "@angular/router";




@Component({
    selector: 'app-produtos',
    templateUrl: './produto.component.html',
    styleUrls: ['./produto.component.scss'],
    imports: [MatTableModule, CommonModule],
})
export class ProdutoComponent implements OnInit {

    produtoName: string = '';
    produtoPrice: number = 0;
    displayedColumns: string[] = [];
    dataSource: CruzamentoTamanhoCorView | null = null;
    loading = signal(true);
    constructor(
        private produtoService: ProdutoService,
        private route: ActivatedRoute,
    ) { }


    async ngOnInit() {
        var referencia = this.route.snapshot.paramMap.get('referencia') ?? '';
        this.dataSource = await this.produtoService.recuperarCruzamentoTamanhoCor(referencia);
        this.loading.set(false);

    }
}