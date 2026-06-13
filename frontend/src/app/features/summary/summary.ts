import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo';

@Component({
    selector: 'app-summary',
    standalone: true,
    imports: [BrandLogoComponent],
    templateUrl: './summary.html',
    styleUrl: './summary.scss',
})
export class SummaryComponent implements OnInit {
    clusterId = 0;
    clusterScore = signal(0);
    totalScore = signal(0);
    clusterLabel = signal('first');
    pausing = signal(false);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
        private game: GameService,
    ) {}

    ngOnInit() {
        this.clusterId = Number(this.route.snapshot.paramMap.get('clusterId'));
        const state = history.state;
        this.clusterScore.set(state?.clusterScore ?? 0);
        this.totalScore.set(state?.totalScore ?? this.auth.gameSession()?.total_score ?? 0);

        const labels = ['first', 'second', 'third', 'fourth'];
        this.clusterLabel.set(labels[this.clusterId - 1] || 'first');
    }

    continue() {
        this.auth.fetchMe().subscribe(() => {
            this.router.navigate(['/clusters']);
        });
    }

    pause() {
        if (this.pausing()) {
            return;
        }

        if (!confirm('Pause and exit? Your progress will be saved.')) {
            return;
        }

        this.pausing.set(true);
        this.game.pause().subscribe({
            next: () => this.auth.logout({ redirectTo: '/' }),
            error: () => {
                this.pausing.set(false);
                alert('Could not pause the game.');
            },
        });
    }
}
