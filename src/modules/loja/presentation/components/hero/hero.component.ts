import { CommonModule } from "@angular/common";
import { Component, Output, EventEmitter } from "@angular/core";

// Porta Angular de `desing system/ui_kits/site/Hero.jsx`.
@Component({
    selector: 'loja-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
})
export class HeroComponent {
    @Output() verColecao = new EventEmitter<void>();
}
