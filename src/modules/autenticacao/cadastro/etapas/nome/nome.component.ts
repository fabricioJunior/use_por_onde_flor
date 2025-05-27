import { Component, EventEmitter, Output, signal, } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-nome-cadastro',
    templateUrl: './nome.component.html',
    styleUrls: ['./nome.component.scss'],
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule],
})
export class NomeComponent {
    @Output() nome = new EventEmitter<string>();
    @Output() nomeValido = new EventEmitter<boolean>();
    @Output() sobrenome = new EventEmitter<string>();
    @Output() sobrenomeValido = new EventEmitter<boolean>();

    nomeFormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
    sobrenomeFormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

    nomeErrorMessage = signal('');
    sobrenomeErrorMessage = signal('');

    constructor() {
        this.nomeFormControl.valueChanges.subscribe((value) => {
            this.nome.emit(value ?? '');
            this.nomeValido.emit(this.nomeFormControl.valid);
            this.updateNomeErrorMessage();
        });

        this.sobrenomeFormControl.valueChanges.subscribe((value) => {
            this.sobrenome.emit(value ?? '');
            this.sobrenomeValido.emit(this.sobrenomeFormControl.valid);
            this.updateSobrenomeErrorMessage();
        });
    }

    updateNomeErrorMessage() {
        if (this.nomeFormControl.hasError('required')) {
            return 'Informe o nome';
        } else if (this.nomeFormControl.hasError('minlength')) {
            return 'Seu nome deve ter no mínimo 3 caracteres';
        }
        return '';
    }
    updateSobrenomeErrorMessage() {
        if (this.sobrenomeFormControl.hasError('required')) {
            return 'Informe o sobrenome';
        } else if (this.sobrenomeFormControl.hasError('minlength')) {
            return 'Seu sobrenome deve ter no mínimo 3 caracteres';
        }
        return '';
    }
}