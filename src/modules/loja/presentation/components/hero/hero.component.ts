import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";
import { LogoComponent } from "../../../../core/common_components/logo.component";

// Porta Angular de `desing system/ui_kits/site/Hero.jsx`.
@Component({
    selector: 'loja-hero',
    standalone: true,
    imports: [CommonModule, RouterLink, TracoComponent, LogoComponent],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css',
})
export class HeroComponent {
}
