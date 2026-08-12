import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { HeaderComponent } from "../../../../loja/presentation/components/header/header.component";
import { FooterComponent } from "../../../../loja/presentation/components/footer/footer.component";
import { PedidosService } from "../../../services/pedidos.service";
import { PedidoDetalheDto } from "../../../data/dto/pedido-detalhe.dto";

@Component({
    selector: 'pedido-detalhe-page',
    standalone: true,
    imports: [CommonModule, HeaderComponent, FooterComponent],
    templateUrl: './pedido.detalhe.page.html',
    styleUrl: './pedido.detalhe.page.css',
})
export class PedidoDetalhePage implements OnInit {
    loading = signal(true);
    naoEncontrado = signal(false);
    erro = signal(false);
    pedido = signal<PedidoDetalheDto | null>(null);

    constructor(private route: ActivatedRoute, private pedidosService: PedidosService) { }

    async ngOnInit(): Promise<void> {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        try {
            this.pedido.set(await this.pedidosService.buscar(id));
        } catch (error) {
            if (error instanceof HttpErrorResponse && error.status === 404) {
                this.naoEncontrado.set(true);
            } else {
                this.erro.set(true);
            }
        } finally {
            this.loading.set(false);
        }
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}
