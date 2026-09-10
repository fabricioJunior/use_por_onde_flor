import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { LogoComponent } from "../../../../core/common_components/logo.component";

// Porta Angular de `desing system/ui_kits/site/Footer.jsx`.
@Component({
    selector: 'loja-footer',
    standalone: true,
    imports: [CommonModule, LogoComponent],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
})
export class FooterComponent { }
