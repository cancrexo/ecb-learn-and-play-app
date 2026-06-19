import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-logo',
    standalone: true,
    templateUrl: './logo.html',
    styleUrl: './logo.scss',
})
export class LogoComponent {
    private router = inject(Router);

    logoSrc = signal('/img/logo-vertical.png');
    logoWidth = signal(1801);
    logoHeight = signal(1920);

    constructor() {
        this.applyRoute(this.router.url);
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            takeUntilDestroyed(),
        ).subscribe((e) => this.applyRoute(e.urlAfterRedirects));
    }

    private applyRoute(url: string) {
        const path = url.split('?')[0];
        const useHorizontal = path.startsWith('/quiz') || path.startsWith('/summary') || [
            '/splash-2',
            '/login',
            '/register',
            '/forgot-password',
            '/instructions',
            '/clusters',
            '/game-over',
        ].includes(path);

        if (useHorizontal) {
            this.logoSrc.set('/img/logo-horizontal.png');
            this.logoWidth.set(2000);
            this.logoHeight.set(1169);
            return;
        }

        this.logoSrc.set('/img/logo-vertical.png');
        this.logoWidth.set(1801);
        this.logoHeight.set(1920);
    }
}
