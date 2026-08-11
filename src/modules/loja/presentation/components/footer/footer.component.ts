import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

// Porta Angular de `desing system/ui_kits/site/Footer.jsx`.
@Component({
    selector: 'loja-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css',
})
export class FooterComponent { }
