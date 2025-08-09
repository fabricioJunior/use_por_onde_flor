import { AfterViewInit, Component, OnInit, signal } from "@angular/core";
import { LogoComponent } from "../../../core/common_components/logo.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router } from "@angular/router";
import { PagamentoService } from "../../services/pagamento.service";
import { PagamentoPendenteDto } from "../../data/dto/pagamento.pendente.dto";
import { PagamentoFinalizadoDto } from "../../data/dto/pagamento.finalizado.dto";
import { firstValueFrom } from "rxjs";

@Component({
    selector: 'app-pagamento',
    templateUrl: './pagamento.component.html',
    styleUrls: ['./pagamento.component.scss'],
    imports: [LogoComponent, MatProgressSpinnerModule]
})
export class PagamentoComponent implements OnInit {


    pagamentoPendente = signal(true);
    constructor(private router: ActivatedRoute, private pagamentoService: PagamentoService) {

    }

    async ngOnInit(): Promise<void> {
        var idPedido = this.router.snapshot.queryParams['idPedido'];
        if (idPedido != null) {
            this.redirecionarParaPagamento(idPedido);
        }
        var receiptUrl = this.router.snapshot.queryParams['receipt_url'];
        var transactionId = this.router.snapshot.queryParams['transaction_id'];
        var capture_method = this.router.snapshot.queryParams['capture_method'];
        var order_nsu = this.router.snapshot.queryParams['order_nsu'];
        var pagamento = new PagamentoFinalizadoDto({
            comprovanteDePagamento: receiptUrl,
            transanctionId: transactionId,
            formaDePagamento: capture_method,
            idPedido: order_nsu,
        });
        await this.delay(1000);
        var observable = await this.pagamentoService.finalizarPedido(pagamento);
        var result = await firstValueFrom(observable);
        document.location.href = result.comprovante?.toString() ?? 'www.useporondeflor.com.br';

    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    redirecionarParaComprovante() { }

    async redirecionarParaPagamento(idPedido: string) {
        var pagamentoPendenteDto = await this.pagamentoService.getPedidoPendente(idPedido);
        console.log(pagamentoPendenteDto);

        if (pagamentoPendenteDto?.pendente ?? false) {
            this.pagamentoService.getUrlPagamento(idPedido).subscribe((value) => {
                document.location.href = value.toString();
            });
        } else {
            this.pagamentoPendente.set(false);
        }
    }
    // Component logic goes here
    //http://localhost:4200/pagamento?capture_method=pix&transaction_id=6a2b67ec-5d41-4e9d-979b-e63675f8c96b&transaction_nsu=6a2b67ec-5d41-4e9d-979b-e63675f8c96b&slug=21TGnE5n3v&order_nsu=7629&receipt_url=https:%2F%2Frecibo.infinitepay.io%2F6a2b67ec-5d41-4e9d-979b-e63675f8c96b
}