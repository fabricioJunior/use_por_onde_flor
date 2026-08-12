import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HeaderComponent } from "../../../../loja/presentation/components/header/header.component";
import { FooterComponent } from "../../../../loja/presentation/components/footer/footer.component";
import { ButtonComponent } from "../../../../loja/presentation/components/ui/button/button.component";
import { PedidosService } from "../../../services/pedidos.service";
import { PedidoListaItemDto } from "../../../data/dto/pedidos-lista.dto";

const ITENS_POR_PAGINA = 10;

@Component({
    selector: 'pedidos-page',
    standalone: true,
    imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, ButtonComponent],
    templateUrl: './pedidos.page.html',
    styleUrl: './pedidos.page.css',
})
export class PedidosPage implements OnInit {
    loading = signal(true);
    carregandoMais = signal(false);
    erro = signal(false);
    itens = signal<PedidoListaItemDto[]>([]);
    temMais = signal(false);
    private pagina = 1;

    constructor(private pedidosService: PedidosService) { }

    async ngOnInit(): Promise<void> {
        await this.carregar(1);
    }

    async carregarMais(): Promise<void> {
        this.carregandoMais.set(true);
        try {
            await this.carregar(this.pagina + 1, true);
        } finally {
            this.carregandoMais.set(false);
        }
    }

    private async carregar(pagina: number, acumular = false): Promise<void> {
        this.loading.set(!acumular);
        this.erro.set(false);
        try {
            const resposta = await this.pedidosService.listar(pagina, ITENS_POR_PAGINA);
            this.pagina = pagina;
            this.itens.set(acumular ? [...this.itens(), ...(resposta.items ?? [])] : (resposta.items ?? []));
            this.temMais.set(!!resposta.temMais);
        } catch {
            this.erro.set(true);
        } finally {
            this.loading.set(false);
        }
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}
