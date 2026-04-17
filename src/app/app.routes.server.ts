import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,


  }
  , {
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
  }
];
