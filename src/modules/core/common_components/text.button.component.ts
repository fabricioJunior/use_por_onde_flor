import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-text-button',
    templateUrl: './text.button.component.html',
    styleUrls: ['./text.button.component.css'],
    imports: [MatButtonModule, MatDividerModule, MatIconModule]
})
export class TextButtonComponent {
    @Input() label: string = 'Button';
    @Input() action: () => void = () => { };
}