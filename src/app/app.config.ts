import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { NgxMaskConfig, provideEnvironmentNgxMask, provideNgxMask } from 'ngx-mask';
import { HttpClientModule, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApiBaseUrlInterceptor } from './config/config.service';
import { UsuarioDocumentoValidoDataSource } from '../modules/autenticacao/data/usuario.documento.valido.data.source';
import { UsuarioEmailValidoDataSource } from '../modules/autenticacao/data/usuario.email.valido.data.source';
import { AutenticacaoService } from '../modules/autenticacao/services/autenticacao.service';
import { UsuarioDataSource } from '../modules/autenticacao/data/usuario.data.source';
import { AutenticacaoDataSource } from '../modules/autenticacao/data/autenticacao.data.source';
import { PagamentoDatasource } from '../modules/pagamento/data/pagamento.datasource';
import { PagamentoService } from '../modules/pagamento/services/pagamento.service';
import { ProdutoDataSource } from '../modules/produtos/data/produto.data.source';
import { ProdutoService } from '../modules/produtos/services/produto.service';
import { PontosService } from '../modules/fidelizacao/pontos/services/pontos.service';
import { PontosDataSource } from '../modules/fidelizacao/pontos/data/pontos.data.source';
import { RecuperarSenhaDataSource } from '../modules/autenticacao/data/recuperar.senha.data.source';
import { ReferenciaDataSource } from '../modules/referencias/data/referencia.data.source';
import { ReferenciaService } from '../modules/referencias/services/referencia.service';
import { PedidosDataSource } from '../modules/pedidos/data/pedidos.data.source';
import { PedidosService } from '../modules/pedidos/services/pedidos.service';
const maskConfig: Partial<NgxMaskConfig> = {
  validation: false,
};
export const appConfig: ApplicationConfig = {

  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideEnvironmentNgxMask(maskConfig),
    provideNgxMask(),
    provideHttpClient(withInterceptors([ApiBaseUrlInterceptor])),
    { provide: UsuarioDocumentoValidoDataSource },
    { provide: UsuarioEmailValidoDataSource },
    { provide: AutenticacaoService },
    { provide: UsuarioDataSource },
    { provide: AutenticacaoDataSource },
    { provide: PagamentoService },
    { provide: PagamentoDatasource },
    { provide: ProdutoDataSource },
    { provide: ProdutoService },
    { provide: PontosService },
    { provide: PontosDataSource, },
    { provide: RecuperarSenhaDataSource },
    { provide: ReferenciaDataSource },
    { provide: ReferenciaService },
    { provide: PedidosDataSource },
    { provide: PedidosService }

  ]
};
