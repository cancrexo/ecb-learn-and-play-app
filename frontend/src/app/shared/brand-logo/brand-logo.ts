import { Component } from '@angular/core';

@Component({
    selector: 'app-brand-logo',
    standalone: true,
    template: '<div class="brand-logo" aria-hidden="true"><span class="brand-logo__label">LOGO HERE</span></div>',
    styles: [`
        :host {
            display: contents;
        }
    `],
})
export class BrandLogoComponent {}
