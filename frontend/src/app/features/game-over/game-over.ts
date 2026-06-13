import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RankingData } from '../../core/models/game.models';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo';

@Component({
    selector: 'app-game-over',
    standalone: true,
    imports: [BrandLogoComponent],
    templateUrl: './game-over.html',
    styleUrl: './game-over.scss',
})
export class GameOverComponent implements OnInit {
    totalScore = signal(0);
    ranking = signal<RankingData | null>(null);
    exiting = signal(false);

    /** Porcentaje de la barra respecto al líder (100% si eres el único jugador). */
    progressPercent = computed(() => {
        const r = this.ranking();
        if (!r) {
            return 0;
        }
        if (r.completed_players <= 1) {
            return 100;
        }
        if (!r.leader_score) {
            return 100;
        }
        return Math.min(100, Math.round((r.total_score / r.leader_score) * 100));
    });

    constructor(
        private router: Router,
        private game: GameService,
        private auth: AuthService,
    ) {}

    ngOnInit() {
        const state = history.state;
        if (state?.ranking) {
            this.totalScore.set(state.totalScore ?? 0);
            this.ranking.set(state.ranking);
        } else {
            this.game.getRanking().subscribe({
                next: (res) => {
                    this.ranking.set(res);
                    this.totalScore.set(res.total_score);
                },
            });
        }
    }

    playAgain() {
        this.game.restart().subscribe({
            next: () => {
                this.auth.fetchMe().subscribe();
                this.router.navigate(['/quiz', 1]);
            },
        });
    }

    exitGame() {
        if (this.exiting()) {
            return;
        }

        if (!confirm('Exit the game? You will need to log in again to play.')) {
            return;
        }

        this.exiting.set(true);
        this.game.abandonProgress().subscribe({
            next: () => this.auth.logout({ redirectTo: '/' }),
            error: () => {
                this.exiting.set(false);
                alert('Could not exit the game.');
            },
        });
    }
}
