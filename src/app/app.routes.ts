import { Routes } from '@angular/router';
import { AcoesComponent } from '../modules/acoes/acoes.component';
import { LoginComponent } from '../modules/autenticacao/login/login.component';
import { CadastroComponent } from '../modules/autenticacao/cadastro/cadastro.component';

export const routes: Routes = [

    { path: 'acoes', component: AcoesComponent },
    { path: 'login', component: LoginComponent },
    { path: 'cadastro', component: CadastroComponent },
    { path: '', redirectTo: '/acoes', pathMatch: 'full' },
];
