import { CommonModule } from "@angular/common";
import { Component, computed } from "@angular/core";
import { Router } from "@angular/router";
import { CarrinhoItemViewDto } from "../../../../carrinho/data/dtos/carrinho-item-view.dto";
import { SacolaService } from "../../../services/sacola.service";
import { formatarPreco, progressoFreteGratis } from "../../../services/preco.apresentacao.util";

// Drawer da sacola (README 1.10) -- compartilhado por todas as telas da loja. Mora dentro do
// header, então qualquer página que use `loja-header` já ganha a sacola. Fonte de dados:
// `SacolaService` -> `CarrinhoFacadeService` (nenhum carrinho novo).
@Component({
    selector: 'sacola-drawer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sacola.drawer.component.html',
    styleUrls: ['../../loja.shared.css', './sacola.drawer.component.css'],
})
export class SacolaDrawerComponent {
    formatarPreco = formatarPreco;

    // null quando a regra de frete grátis está desligada (sem mínimo no backend) -- a barra não
    // aparece em vez de mostrar um valor inventado.
    frete = computed(() => progressoFreteGratis(this.sacola.subtotal()));

    constructor(public sacola: SacolaService, private router: Router) { }

    nomeItem(item: CarrinhoItemViewDto): string {
        return item.nome ?? 'Produto';
    }

    variacao(item: CarrinhoItemViewDto): string {
        return [item.corNome, item.tamanhoNome, item.estampaNome].filter(Boolean).join(' · ');
    }

    totalLinha(item: CarrinhoItemViewDto): number {
        return (item.valorPromocional ?? item.valor ?? 0) * (item.quantidade ?? 0);
    }

    alterar(item: CarrinhoItemViewDto, delta: number): void {
        void this.sacola.definirQuantidade(item, (item.quantidade ?? 0) + delta);
    }

    finalizar(): void {
        this.sacola.fechar();
        this.router.navigate(['/checkout']);
    }
}
