import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonComponent } from "../ui/button/button.component";
import { BadgeComponent } from "../ui/badge/badge.component";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";

@Component({
    selector: 'produto-card',
    standalone: true,
    imports: [CommonModule, ButtonComponent, BadgeComponent],
    templateUrl: './produto.card.component.html',
    styleUrl: './produto.card.component.css',
})
export class ProdutoCardComponent {
    @Input({ required: true }) referencia!: EcommerceReferenciaDto;
    // ponytail: backend ainda não expõe esse campo, ninguém passa true hoje — deixa o componente pronto.
    @Input() novo?: boolean;
    @Output() abrir = new EventEmitter<void>();
    @Output() adicionar = new EventEmitter<void>();

    // Mesmo critério de loja.home.page.ts (validarEstoque antes de adicionar ao carrinho) -- saldo
    // undefined (produto sem saldo/disponibilidade calculada) também conta como sem estoque aqui.
    semEstoque(): boolean {
        return !this.referencia.saldo || this.referencia.saldo <= 0;
    }

    onAdicionarClick(event: Event) {
        event.stopPropagation();
        this.adicionar.emit();
    }

    formatarPreco(valor: number): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}
