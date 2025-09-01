import { Component, OnInit, signal } from "@angular/core";
import { PagamentoService } from "../../services/pagamento.service";
import { ActivatedRoute } from "@angular/router";
import { PagamentoDto } from "../../data/dto/pagamento.dto";
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { log } from "console";
@Component({
    selector: 'pagamentos-page',
    templateUrl: './pagamento.component.html',
    styleUrls: ['./pagamento.component.scss'],
    imports: [ClipboardModule, MatIconButton, MatIcon, MatButton]
})
export class PagamentoComponent implements OnInit {


    pagamento?: PagamentoDto;

    loading = signal(true);

    constructor(private pagamentoService: PagamentoService, private router: ActivatedRoute) { }

    ngOnInit(): void {
        var orderNsu = this.router.snapshot.params['orderNsu'];
        this.pagamentoService.getPagamento(orderNsu).subscribe((value) => {
            this.pagamento = value;
            this.loading.set(false);
        });
    }

    async onCancelarTap() {
        this.loading.set(true);
        this.pagamento = await this.pagamentoService.cancelarPagamento(this.pagamento?.orderNsu!);
        console.log(this.pagamento);
        this.loading.set(false);
    }


    async onTapAtivarPagamento() {
        this.loading.set(true);
        this.pagamento = await this.pagamentoService.ativarPagamento(this.pagamento?.orderNsu!);
        this.loading.set(false);
    }


}