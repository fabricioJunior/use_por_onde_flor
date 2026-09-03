import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

@Component(
    {
        selector: 'app-logo',
        templateUrl: './logo.component.html',
        styleUrls: ['./logo.component.css'],

    }
)
export class LogoComponent {

    /** 'clara' = Preferencial (tinta+sálvia), fundo claro. 'negativa' = branco, fundo escuro. */
    @Input() variante: 'clara' | 'negativa' = 'clara';
    /** altura em px — largura acompanha proporcionalmente. */
    @Input() altura: number = 36;

    constructor(private router: Router) {
    }

    onLogoTap() {
        this.router.navigate(['/']);
    }

}