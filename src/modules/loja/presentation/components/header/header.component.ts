import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";

// Porta Angular de `desing system/ui_kits/site/Header.jsx`.
@Component({
    selector: 'loja-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent {
    @Input() itensNoCarrinho = 0;
}
