import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { LogoComponent } from "../../../../core/common_components/logo.component";
import { PontoComponent } from "../../components/ponto/ponto.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';

@Component(
    {
        selector: 'pontos-page',
        templateUrl: './pontos.component.html',
        styleUrls: ['./pontos.component.scss'],
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
        imports: [LogoComponent, PontoComponent, MatIconModule, MatButtonModule,],
    }
)
export class PontosComponent implements OnInit {

    ngOnInit(): void {

    }
} 