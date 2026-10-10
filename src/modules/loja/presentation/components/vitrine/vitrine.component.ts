import { CommonModule } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { EcommerceReferenciaDto } from "../../../data/dtos/ecommerce-referencia.dto";
import { ProdutoCardComponent } from "../produto_card/produto.card.component";

// Vitrine horizontal (README 1.6) -- mesmo componente usado pelas vitrines da home e pelo
// "Você também pode gostar" da página de produto. Vitrine sem produto não renderiza nada.
@Component({
    selector: 'loja-vitrine',
    standalone: true,
    imports: [CommonModule, RouterLink, ProdutoCardComponent],
    templateUrl: './vitrine.component.html',
    styleUrl: './vitrine.component.css',
})
export class VitrineComponent {
    @ViewChild('trilho') trilho?: ElementRef<HTMLElement>;

    @Input() kicker?: string | null;
    @Input({ required: true }) titulo!: string;
    @Input() destaque = false;
    /** Rota do "Ver tudo" -- ausente esconde o link (ex: relacionados, que não têm página). */
    @Input() verTudoRota?: (string | number)[] | null;
    @Input({ required: true }) referencias: EcommerceReferenciaDto[] = [];

    rolar(direcao: 1 | -1): void {
        const el = this.trilho?.nativeElement;
        el?.scrollBy({ left: direcao * el.clientWidth, behavior: 'smooth' });
    }
}
