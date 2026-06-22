import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevResetFabComponent } from './shared/dev-reset-fab/dev-reset-fab';
import { LogoComponent } from './shared/logo/logo';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, DevResetFabComponent, LogoComponent],
    template: `
        <app-dev-reset-fab />
        <app-logo />
        <router-outlet />
    `,
    styleUrl: './app.scss',
})
export class App {}
