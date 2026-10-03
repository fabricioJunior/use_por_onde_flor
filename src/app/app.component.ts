import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MetaPixelService } from '../modules/core/meta-pixel/meta-pixel.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',

})
export class AppComponent implements OnInit {
  title = 'use_por_onde_flor';

  constructor(
    private metaPixel: MetaPixelService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Não bloqueia a página: config e script do Pixel carregam em segundo plano (e só no navegador).
    void this.metaPixel.iniciar();
    // PageView a cada navegação (o app é SPA, o Pixel só vê o carregamento inicial sozinho).
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => this.metaPixel.pageView());
  }
}
