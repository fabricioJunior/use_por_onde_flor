import { CommonModule } from "@angular/common";
import { Component, OnInit, computed, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CarrinhoFacadeService } from "../../../services/carrinho.facade.service";
import { CarrinhoItemViewDto } from "../../../data/dtos/carrinho-item-view.dto";
import { ButtonComponent } from "../../../../loja/presentation/components/ui/button/button.component";

@Component({
    selector: 'carrinho-page',
    standalone: true,
    imports: [CommonModule, RouterLink, MatProgressSpinnerModule, ButtonComponent],
    templateUrl: './carrinho.page.html',
    styleUrl: './carrinho.page.css',
})
export class CarrinhoPage implements OnInit {
    loading = signal(true);
    itens = signal<CarrinhoItemViewDto[]>([]);

    total = computed(() => this.itens().reduce((soma, item) => soma + (item.valor ?? 0) * (item.quantidade ?? 0), 0));

    constructor(private carrinhoFacadeService: CarrinhoFacadeService, private router: Router) { }

    async ngOnInit(): Promise<void> {
        await this.carregar();
    }

    private async carregar(): Promise<void> {
        this.loading.set(true);
        try {
            this.itens.set(await this.carrinhoFacadeService.listar());
        } finally {
            this.loading.set(false);
        }
    }

    async alterarQuantidade(item: CarrinhoItemViewDto, quantidade: number): Promise<void> {
        if (quantidade < 1) {
            await this.remover(item);
            return;
        }
        await this.carrinhoFacadeService.adicionar(item.produtoId!, quantidade);
        await this.carregar();
    }

    async remover(item: CarrinhoItemViewDto): Promise<void> {
        await this.carrinhoFacadeService.remover(item.produtoId!);
        await this.carregar();
    }

    formatarPreco(valor: number | undefined): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    irParaCheckout(): void {
        this.router.navigate(['/checkout']);
    }
}
