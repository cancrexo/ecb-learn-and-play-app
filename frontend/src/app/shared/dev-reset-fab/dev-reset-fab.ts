import { Component } from '@angular/core';
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
    ) {}

    resetProgress() {
        if (!this.auth.isLoggedIn()) {
            return;
        }

        if (!confirm('Reset game progress and log out? (dev only)')) {
            return;
        }

        this.game.abandonProgress().subscribe({
            next: () => {
                this.auth.logout({ redirectTo: '/', reload: true });
            },
            error: () => alert('Could not reset progress.'),
        });
    }
}
