import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClusterItem } from '../../core/models/game.models';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';

@Component({
    selector: 'app-clusters',
    standalone: true,
    imports: [],
    templateUrl: './clusters.html',
    styleUrl: './clusters.scss',
})
export class ClustersComponent implements OnInit {
    clusters = signal<ClusterItem[]>([]);
    error = signal('');

    constructor(
        private game: GameService,
        private auth: AuthService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.auth.fetchMe().subscribe({
            next: () => this.initView(),
            error: () => this.error.set('Could not load session'),
        });
    }

    private initView() {
        const session = this.auth.gameSession();

        if (session?.status === 'completed') {
            this.router.navigate(['/game-over']);
            return;
        }

        if (
            (session?.status === 'in_progress' || session?.status === 'paused')
            && session.current_question_id
        ) {
            this.router.navigate(['/quiz', session.current_cluster_id]);
            return;
        }

        this.loadClusters();
    }

    private loadClusters() {
        this.game.getClusters().subscribe({
            next: (res) => this.clusters.set(res.clusters),
            error: () => this.error.set('Could not load levels'),
        });
    }

    selectCluster(cluster: ClusterItem) {
        if (cluster.status === 'locked' || cluster.status === 'completed') {
            return;
        }

        this.game.startGame(cluster.id).subscribe({
            next: () => {
                this.auth.fetchMe().subscribe(() => {
                    this.router.navigate(['/quiz', cluster.id]);
                });
            },
            error: (err) => this.error.set(err.error?.message || 'Could not start level'),
        });
    }
}
