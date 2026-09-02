import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'app-filled-button',
    templateUrl: './filled.button.component.html',
    styleUrls: ['./filled.button.component.css'],
})
export class FilledButtonComponent {
    @Input() label: string = 'Button';
    @Output() onTap = new EventEmitter<void>()
    @Input() enabled: boolean = true;
}
