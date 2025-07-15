import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal, } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FilledButtonComponent } from "../../../../core/common_components/filled.button.component";
import { Router } from '@angular/router';
import { CadastroComponent } from '../../cadastro.component';


@Component({
    selector: 'app-nome-cadastro',
    templateUrl: './nome.component.html',
    styleUrls: ['./nome.component.scss'],
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, FilledButtonComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class NomeComponent {


    nomeErrorMessage = signal('');
    sobrenomeErrorMessage = signal('');

    avancarEnable = signal(false);

    formGroup: FormGroup;

    constructor(cadastroComponent: CadastroComponent, private router: Router) {
        this.formGroup = cadastroComponent.cadastroFromGroup;
        this.formGroup.get('nome')!.valueChanges.subscribe((value) => {
            this.updateNomeErrorMessage();
            this.avancaEnableUpdate();
        });
        console.log('constructor');
        this.formGroup.get('sobrenome')!.valueChanges.subscribe((value) => {
            this.updateSobrenomeErrorMessage();
            this.avancaEnableUpdate();
        });
    }

    updateNomeErrorMessage() {
        console.log('updateNomeErrorMessage');
        if (this.formGroup.get('nome')!.hasError('required')) {
            return 'Informe o nome';
        } else if (this.formGroup.get('nome')!.hasError('minlength')) {
            return 'Seu nome deve ter no mínimo 3 caracteres';
        } else {
            return '';
        }

    }
    updateSobrenomeErrorMessage() {
        if (this.formGroup.get('sobrenome')!.hasError('required')) {
            return 'Informe o sobrenome';
        } else if (this.formGroup.get('sobrenome')!.hasError('minlength')) {
            return 'Seu sobrenome deve ter no mínimo 3 caracteres';
        } else {
            return '';
        }
    }

    avancaEnableUpdate() {
        var enable = !this.formGroup.get('sobrenome')?.invalid && !this.formGroup.get('nome')?.invalid;
        this.avancarEnable.set(enable);
    }

    onAvancarTap() {
        this.router.navigate(['/cadastro', { outlets: { cadastroOutlet: ['infoBasicas'] } }]);
    }
}