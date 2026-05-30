import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-summary',
    standalone: true,
    templateUrl: './summary.html',
    styleUrl: './summary.scss',
})
export class SummaryComponent implements OnInit {
    clusterId = 0;
    clusterScore = signal(0);
    totalScore = signal(0);
    clusterLabel = signal('first');

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
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
        console.log('pausa');
    }
}
