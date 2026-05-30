import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';

@Component({
    selector: 'app-dev-reset-fab',
    standalone: true,
    templateUrl: './dev-reset-fab.html',
    styleUrl: './dev-reset-fab.scss',
})
export class DevResetFabComponent {
    readonly isDev = !environment.production;

    constructor(
        protected auth: AuthService,
        private game: GameService,
        private router: Router,
    ) {}

    resetProgress() {
        if (!this.auth.isLoggedIn()) {
            return;
        }

        if (!confirm('Reset game progress? (dev only)')) {
            return;
        }

        this.game.abandonProgress().subscribe({
            next: () => {
                this.auth.fetchMe().subscribe();
                this.router.navigate(['/clusters']);
            },
            error: () => alert('Could not reset progress.'),
        });
    }
}
