import { ChangeDetectionStrategy, Component, Input, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule, Validators, FormsModule, FormGroup } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { merge } from "rxjs";
import { Output, EventEmitter } from '@angular/core';
import { LoginComponent } from "../../login.component";

@Component({
    selector: 'app-email',
    templateUrl: './email.component.html',
    styleUrls: ['./email.component.css'],
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailComponent {
    errorMessage = signal('');
    emailFormControl = new FormControl('', [Validators.required, Validators.email]);;
    @Output() emailChange = new EventEmitter<string>();
    @Output() emailValido = new EventEmitter<boolean>();

    loginGroup: FormGroup;
    constructor(loginComponent: LoginComponent) {
        this.loginGroup = loginComponent.loginGroup;
        merge(loginComponent.loginGroup.get('email')!.statusChanges, this.emailFormControl.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
    }

    updateErrorMessage() {
        if (this.emailFormControl.hasError('required')) {
            this.errorMessage.set('Informe o email');
        } else if (this.emailFormControl.hasError('email')) {
            this.errorMessage.set('Informe um email válido');
        } else {
            this.errorMessage.set('teste');
        }
        this.emailChange.emit(this.emailFormControl.value?.toString() ?? '');
        this.emailValido.emit(this.emailFormControl.valid);

    }
}