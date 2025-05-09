import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";


@Component({
    selector: 'app-filled-button',
    templateUrl: './filled.button.component.html',
    styleUrls: ['./filled.button.component.css'],
    imports: [MatButtonModule, MatDividerModule, MatIconModule]
})
export class FilledButtonComponent {
    @Input() label: string = 'Button';
    @Input() action: () => void = () => { };
    @Input() enabled: boolean = true;
    @Input() color: string = 'primary';
}