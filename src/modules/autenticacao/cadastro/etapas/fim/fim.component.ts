import { Component } from "@angular/core";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { Router } from "@angular/router";
import { CadastroComponent } from "../../cadastro.component";


@Component({
    selector: 'fim-cadastro',
    templateUrl: './fim.component.html',
    styleUrl: './fim.component.scss',
    imports: [FilledButtonComponent],
})
export class FimComponent {

    constructor(private router: Router, private cadastroComponent: CadastroComponent) {

    }

    onAvancarTap() {
        const returnUrl = this.cadastroComponent.returnUrl();
        this.router.navigate(['/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
    }

}