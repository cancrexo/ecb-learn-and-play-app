import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevResetFabComponent } from './shared/dev-reset-fab/dev-reset-fab';
import { LogoComponent } from './shared/logo/logo';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, DevResetFabComponent, LogoComponent],
    template: `
        <app-logo />
        <router-outlet />
        <app-dev-reset-fab />
    `,
    styleUrl: './app.scss',
})
export class App {}
