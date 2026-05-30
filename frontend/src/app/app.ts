import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevResetFabComponent } from './shared/dev-reset-fab/dev-reset-fab';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, DevResetFabComponent],
    template: `
        <router-outlet />
        <app-dev-reset-fab />
    `,
    styleUrl: './app.scss',
})
export class App {}
