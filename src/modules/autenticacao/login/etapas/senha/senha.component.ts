import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from "@angular/core";
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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginSenhaComponent {

    errorMessage = signal('');
    senhaFormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);;
    @Output() senhaChange = new EventEmitter<string>();
    @Output() senhaValida = new EventEmitter<boolean>();

    constructor() {

        merge(this.senhaFormControl.statusChanges, this.senhaFormControl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
    }

    updateErrorMessage() {
        if (this.senhaFormControl.hasError('required')) {
            this.errorMessage.set('Informe a senha');
        } else if (this.senhaFormControl.hasError('minlength')) {
            this.errorMessage.set('Sua senha deve ter no mínimo 6 caracteres');
        }

        this.senhaChange.emit(this.senhaFormControl.value?.toString() ?? '');
        this.senhaValida.emit(this.senhaFormControl.valid);

    }
}