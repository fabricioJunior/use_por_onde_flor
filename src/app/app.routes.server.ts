import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,


  }
  , {
    path: 'produto/:referencia',
    renderMode: RenderMode.Client,
  }
];
