import { Component, EventEmitter, Input, Output } from "@angular/core";
import { PofLoaderComponent } from "./pof_loader/pof.loader.component";

@Component({
    selector: 'app-filled-button',
    templateUrl: './filled.button.component.html',
    styleUrls: ['./filled.button.component.css'],
    imports: [PofLoaderComponent],
})
export class FilledButtonComponent {
    @Input() label: string = 'Button';
    @Output() onTap = new EventEmitter<void>()
    @Input() enabled: boolean = true;
    @Input() loading: boolean = false;
    @Input() loadingLabel?: string;
}
