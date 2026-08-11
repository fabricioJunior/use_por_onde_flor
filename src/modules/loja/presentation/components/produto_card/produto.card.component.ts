import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonComponent } from "../ui/button/button.component";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";

@Component({
    selector: 'produto-card',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './produto.card.component.html',
    styleUrl: './produto.card.component.css',
})
export class ProdutoCardComponent {
    @Input({ required: true }) referencia!: EcommerceReferenciaDto;
    @Output() abrir = new EventEmitter<void>();
    @Output() adicionar = new EventEmitter<void>();

    onAdicionarClick(event: Event) {
        event.stopPropagation();
        this.adicionar.emit();
    }

    formatarPreco(valor: number): string {
        return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}
