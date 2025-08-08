import { Component, OnInit, signal } from "@angular/core";
import { LogoComponent } from "../../../core/common_components/logo.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router } from "@angular/router";
import { PagamentoService } from "../../services/pagamento.service";

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
}