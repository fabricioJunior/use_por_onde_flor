import { Component, EventEmitter, Output, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { merge } from "rxjs";

@Component({
    selector: 'app-senha',
    templateUrl: './senha.component.html',
    styleUrls: ['./senha.component.css'],
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule],
})
export class SenhaComponent {

    errorMessage = signal('');
    senhaFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);;
    @Output() senhaChange = new EventEmitter<string>();

    constructor() {

        merge(this.senhaFormControl.statusChanges, this.senhaFormControl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
    }

    updateErrorMessage() {
        if (this.senhaFormControl.hasError('required')) {
            this.errorMessage.set('Informe o email');
        } else if (this.senhaFormControl.hasError('minlength')) {
            this.errorMessage.set('Informe uma senha maior que 6 caracteres');
        }
        this.senhaChange.emit(this.senhaFormControl.value?.toString() ?? '');

    }
}