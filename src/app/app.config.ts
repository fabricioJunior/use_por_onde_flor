import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgxMaskConfig, provideEnvironmentNgxMask } from 'ngx-mask';
import { HttpClientModule, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApiBaseUrlInterceptor } from './config/config.service';
import { UsuarioDocumentoValidoDataSource } from '../modules/autenticacao/data/usuario.documento.valido.data.source';
import { UsuarioEmailValidoDataSource } from '../modules/autenticacao/data/usuario.email.valido.data.source';
import { AutenticacaoService } from '../modules/autenticacao/services/autenticacao.service';
import { UsuarioDataSource } from '../modules/autenticacao/data/usuario.data.source';
import { AutenticacaoDataSource } from '../modules/autenticacao/data/autenticacao.data.source';
const maskConfig: Partial<NgxMaskConfig> = {
  validation: false,
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideEnvironmentNgxMask(maskConfig),
    provideHttpClient(withInterceptors([ApiBaseUrlInterceptor])),
    { provide: UsuarioDocumentoValidoDataSource },
    { provide: UsuarioEmailValidoDataSource },
    { provide: AutenticacaoService },
    { provide: UsuarioDataSource },
    { provide: AutenticacaoDataSource },
  ]
};
