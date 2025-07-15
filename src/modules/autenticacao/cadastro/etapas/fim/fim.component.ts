import { Component } from "@angular/core";
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { Router } from "@angular/router";


@Component({
    selector: 'fim-cadastro',
    templateUrl: './fim.component.html',
    styleUrl: './fim.component.scss',
    imports: [FilledButtonComponent],
})
export class FimComponent {

    constructor(private router: Router) {

    }

    onAvancarTap() {
        this.router.navigate(['/login']);
    }

}