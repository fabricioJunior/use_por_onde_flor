import { Component, OnInit, signal } from "@angular/core";
import { LogoComponent } from "../../../core/common_components/logo.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute } from "@angular/router";
import { PagamentoService } from "../../services/pagamento.service";
import { firstValueFrom } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'app-pagamento',
    templateUrl: './pagamento.status.component.html',
    styleUrls: ['./pagamento.status.component.scss'],
    imports: [LogoComponent, MatProgressSpinnerModule]
})
export class PagamentoStatusComponent implements OnInit {


    fluxoInvalido = signal(false);
    pagamentoExpirado = signal(false);
    pedidoId = signal<string | null>(null);
    constructor(private router: ActivatedRoute, private pagamentoService: PagamentoService) {

    }

    async ngOnInit(): Promise<void> {
        var receiptUrl = this.router.snapshot.queryParams['receipt_url'];
        var orderNsu = this.router.snapshot.queryParams['order_nsu'];
        var pedidoId = this.router.snapshot.queryParams['pedidoId'];

        if (receiptUrl) {
            document.location.href = receiptUrl;
            return;
        }

        // Retorno do checkout novo (pix "já paguei" ou pedido sem cobrança online) -- não tem
        // order_nsu de pagamento avulso, só o id do pedido criado. Não há endpoint público de
        // status por pedidoId ainda, então só confirma o recebimento.
        if (!orderNsu && pedidoId) {
            this.pedidoId.set(pedidoId);
            return;
        }

        if (!orderNsu) {
            this.fluxoInvalido.set(true);
            return;
        }

        try {
            var response = await firstValueFrom(this.pagamentoService.getUrlPagamentoPorOrderNsu(orderNsu));
            if (response?.urlDePagamento) {
                document.location.href = response.urlDePagamento;
                return;
            }
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 410) {
                this.pagamentoExpirado.set(true);
                return;
            }
            console.error('Erro ao obter a URL de pagamento por order_nsu', error);
        }

        this.fluxoInvalido.set(true);
    }
    // Component logic goes here
    //http://localhost:4200/pagamento?capture_method=pix&transaction_id=6a2b67ec-5d41-4e9d-979b-e63675f8c96b&transaction_nsu=6a2b67ec-5d41-4e9d-979b-e63675f8c96b&slug=21TGnE5n3v&order_nsu=7629&receipt_url=https:%2F%2Frecibo.infinitepay.io%2F6a2b67ec-5d41-4e9d-979b-e63675f8c96b
}