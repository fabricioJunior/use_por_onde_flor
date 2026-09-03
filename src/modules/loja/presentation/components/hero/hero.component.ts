import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";

// Porta Angular de `desing system/ui_kits/site/Hero.jsx`.
@Component({
    selector: 'loja-hero',
    standalone: true,
    imports: [CommonModule, TracoComponent],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
})
export class HeroComponent {
}
