import { Component } from "@angular/core";
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";

@Component({
    selector: 'app-informacoes-basicas',
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, MatSelectModule, NgxMaskDirective],
    templateUrl: './informacoes.basicas.component.html',
    styleUrl: './informacoes.basicas.component.scss',
    providers: [provideNgxMask()]
})

export class InformacoesBasicasComponent {

}