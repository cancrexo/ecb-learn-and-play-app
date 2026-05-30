import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RankingData } from '../../core/models/game.models';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';

@Component({
    selector: 'app-game-over',
    standalone: true,
    templateUrl: './game-over.html',
    styleUrl: './game-over.scss',
})
export class GameOverComponent implements OnInit {
    totalScore = signal(0);
    ranking = signal<RankingData | null>(null);

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
}
