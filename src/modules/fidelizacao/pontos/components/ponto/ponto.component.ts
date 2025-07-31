import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ponto-app',
    templateUrl: './ponto.component.html',
    styleUrl: './ponto.component.scss'
})
export class PontoComponent implements OnInit {
    currentOpacity = 0.5;

    @Input() enable = false;

    constructor() {

    }
    ngOnInit(): void {
        console.log(this.enable);
        if (this.enable) {
            this.currentOpacity = 1.0;
        } else {
            this.currentOpacity = 0.5;
        }
    }
}