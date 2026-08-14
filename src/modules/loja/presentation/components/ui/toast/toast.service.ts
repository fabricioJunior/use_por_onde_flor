import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import { ToastComponent } from "./toast.component";

const AUTO_DISMISS_MS = 2200;

// Fila simples de toasts no canto inferior direito via CDK Overlay.
@Injectable({ providedIn: 'root' })
export class ToastService {
    constructor(private overlay: Overlay) { }

    show(message: string, tone: 'neutral' | 'success' | 'error' = 'neutral'): void {
        const overlayRef = this.overlay.create({
            positionStrategy: this.overlay.position()
                .global()
                .bottom('24px')
                .right('24px'),
            panelClass: 'ui-toast-overlay-panel',
        });

        const portal = new ComponentPortal(ToastComponent);
        const componentRef = overlayRef.attach(portal);
        componentRef.instance.message = message;
        componentRef.instance.tone = tone;

        setTimeout(() => overlayRef.dispose(), AUTO_DISMISS_MS);
    }
}
