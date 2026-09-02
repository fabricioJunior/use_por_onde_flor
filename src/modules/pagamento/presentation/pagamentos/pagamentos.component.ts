import { Component, inject, OnInit, signal } from "@angular/core";
import { PagamentoService } from "../../services/pagamento.service";
import { PagamentoDto } from "../../data/dto/pagamento.dto";
import { MatList, MatListModule } from "@angular/material/list";
import { MatRippleModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { PofLoaderComponent } from "../../../core/common_components/pof_loader/pof.loader.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";
import { log } from "node:console";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { NovoPagamentoComponent } from "../pagamento/dialogs/novo pagamento/novo.pagamento.component";


@Component({
    selector: 'pagamentos-page',
    templateUrl: './pagamentos.component.html',
    styleUrls: ['./pagamentos.component.scss'],
    imports: [MatList, MatRippleModule, MatInputModule, MatCardModule, MatListModule, PofLoaderComponent, ReactiveFormsModule, MatIconModule, MatButtonModule]
})
export class PagamentosComponent implements OnInit {


    pagamentos: PagamentoDto[] = [];
    totalPagamentos = signal(0);

    loading = signal(true);

    private _bottomSheet = inject(MatBottomSheet);

    constructor(private pagamentoService: PagamentoService, private router: Router) {

    }

    ngOnInit(): void {
        this.carregarPagamentos();
    }

    carregarPagamentos() {
        this.loading.set(true);
        this.pagamentoService.getPagamentos({
            pagamentosDeHoje: true
        }).subscribe((value) => {
            this.pagamentos = value;
            this.loading.set(false);
            this.atualizarTotalPagamentos();
        })
    }

    atualizarTotalPagamentos() {
        var total = this.pagamentos.reduce<number>((acumulador, currentValor) => (currentValor?.valor ?? 0) + acumulador, 0);
        this.totalPagamentos.set(total);
    }

    onTapPagamento(pagamento: PagamentoDto) {
        this.router.navigate(['/pagamento', pagamento.orderNsu]);
    }

    onNovoPagamentoTap() {
        this._bottomSheet.open(NovoPagamentoComponent,).afterDismissed().subscribe((value) => {
            console.log(value);
            this.router.navigate(['/pagamento', value.orderNsu]);
        });
    }


}