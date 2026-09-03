import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'produto/:referencia',
    renderMode: RenderMode.Client,
  },
  {
    path: 'referencias/:referencia',
    renderMode: RenderMode.Client,
  },
  {
    path: 'referencia/:referencia',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pagamento/:orderNsu',
    renderMode: RenderMode.Client,
  },
  {
    path: 'loja/referencia/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'loja/categoria/:slug',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pedidos/:id',
    renderMode: RenderMode.Client,
  },
  {
    // Sem parâmetro, mas dependem de dados dinâmicos (catálogo/carrinho/status da loja) --
    // renderizar no cliente evita bater na API real durante o prerender do build.
    path: 'loja',
    renderMode: RenderMode.Client,
  },
  {
    path: 'carrinho',
    renderMode: RenderMode.Client,
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  }
];
