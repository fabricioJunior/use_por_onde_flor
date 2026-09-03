import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-text-button',
    templateUrl: './text.button.component.html',
    styleUrls: ['./text.button.component.css'],
})
export class TextButtonComponent {
    @Input() label: string = 'Button';
    @Input() action: () => void = () => { };
}
