import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { TracoComponent } from "../../../../core/common_components/traco/traco.component";

// Porta Angular de `desing system/ui_kits/site/Footer.jsx`.
@Component({
    selector: 'loja-footer',
    standalone: true,
    imports: [CommonModule, LogoComponent, TracoComponent],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
})
export class FooterComponent { }
