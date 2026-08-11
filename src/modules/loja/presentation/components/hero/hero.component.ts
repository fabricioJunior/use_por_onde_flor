import { CommonModule } from "@angular/common";
import { Component, Output, EventEmitter } from "@angular/core";
import { ButtonComponent } from "../ui/button/button.component";

// Porta Angular de `desing system/ui_kits/site/Hero.jsx`.
@Component({
    selector: 'loja-hero',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
})
export class HeroComponent {
    @Output() verColecao = new EventEmitter<void>();
}
