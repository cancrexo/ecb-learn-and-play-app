import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    AnswerResult,
    ClusterInfo,
    QuestionAnswer,
    QuestionData,
    TimelineItem,
} from '../../core/models/game.models';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { GameHeaderComponent } from '../../shared/game-header/game-header';
import { PathTimelineComponent } from './path-timeline/path-timeline';

@Component({
    selector: 'app-quiz',
    standalone: true,
    imports: [GameHeaderComponent, PathTimelineComponent],
    templateUrl: './quiz.html',
    styleUrl: './quiz.scss',
})
export class QuizComponent implements OnInit, OnDestroy {
    /** Letras visuales para las opciones barajadas */
    readonly answerLetters = ['A', 'B', 'C', 'D'];

    question = signal<QuestionData | null>(null);
    cluster = signal<ClusterInfo | null>(null);
    timeline = signal<TimelineItem[]>([]);
    score = signal(0);
    feedback = signal<AnswerResult | null>(null);
    isLast = signal(false);
    error = signal('');

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private game: GameService,
        private auth: AuthService,
    ) {}

    ngOnInit() {
        document.body.classList.add('quiz-route');
        this.loadState();
    }

    ngOnDestroy() {
        document.body.classList.remove('quiz-route');
    }

    loadState() {
        this.game.getCurrent().subscribe({
            next: (res) => {
                if (!res.session || !res.question) {
                    this.router.navigate(['/clusters']);
                    return;
                }
                this.score.set(res.session.total_score);
                this.cluster.set(res.cluster ?? null);
                this.question.set(this.prepareQuestion(res.question));
                this.timeline.set(res.timeline || []);
                this.isLast.set(!!res.is_last_question_in_cluster);
                this.feedback.set(null);
            },
            error: () => this.error.set('Could not load question'),
        });
    }

    selectAnswer(index: number) {
        if (this.feedback()) {
            return;
        }

        const q = this.question();
        if (!q) {
            return;
        }

        this.game.submitAnswer(q.id_question, index).subscribe({
            next: (res) => {
                this.feedback.set(res);
                this.score.set(res.total_score);
                this.isLast.set(res.is_last_in_cluster);
                // Actualizar timeline sin borrar el feedback
                this.game.getCurrent().subscribe({
                    next: (state) => {
                        if (state.timeline) {
                            this.timeline.set(state.timeline);
                        }
                    },
                });
            },
            error: (err) => this.error.set(err.error?.message || 'Error submitting answer'),
        });
    }

    nextStep() {
        this.game.advance().subscribe({
            next: (res) => {
                if (res['action'] === 'cluster_completed') {
                    this.auth.fetchMe().subscribe(() => {
                        this.router.navigate(['/summary', res['cluster_id']], {
                            state: {
                                clusterScore: res['cluster_score'],
                                totalScore: res['total_score'],
                            },
                        });
                    });
                } else if (res['action'] === 'game_completed') {
                    this.router.navigate(['/game-over'], {
                        state: {
                            totalScore: res['total_score'],
                            ranking: res['ranking'],
                        },
                    });
                } else {
                    this.loadState();
                }
            },
            error: (err) => this.error.set(err.error?.message || 'Error advancing'),
        });
    }

    /** Mezcla el orden visual; el index original se conserva al responder. */
    private prepareQuestion(question: QuestionData): QuestionData {
        return {
            ...question,
            answers: shuffleAnswers(question.answers),
        };
    }
}

function shuffleAnswers(items: QuestionAnswer[]): QuestionAnswer[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
