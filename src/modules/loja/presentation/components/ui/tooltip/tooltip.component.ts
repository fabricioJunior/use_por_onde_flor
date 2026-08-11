import { Directive, Input } from "@angular/core";

// Porta Angular de `desing system/components/feedback/Tooltip.jsx`.
// Diretiva de atributo: mostra `[uiTooltip]` num balão via CSS (::after em .ui-tooltip-host), sem overlay CDK.
@Directive({
    selector: '[uiTooltip]',
    standalone: true,
    host: {
        'class': 'ui-tooltip-host',
        '[attr.data-tooltip]': 'uiTooltip',
    },
})
export class TooltipDirective {
    @Input() uiTooltip = '';
}
