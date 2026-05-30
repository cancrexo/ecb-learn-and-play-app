import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
    AnswerResult,
    ClusterInfo,
    ClusterItem,
    GameSession,
    QuestionData,
    RankingData,
    TimelineItem,
} from '../models/game.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GameService {
    constructor(
        private http: HttpClient,
        private auth: AuthService,
    ) {}

    getClusters() {
        return this.http.get<{ clusters: ClusterItem[] }>(`${environment.apiUrl}/clusters`);
    }

    startGame(clusterId: number) {
        return this.http.post<{ session: GameSession; state: unknown }>(`${environment.apiUrl}/game/start`, {
            cluster_id: clusterId,
        });
    }

    getCurrent() {
        return this.http.get<{
            session: GameSession | null;
            cluster?: ClusterInfo;
            question?: QuestionData;
            timeline?: TimelineItem[];
            is_last_question_in_cluster?: boolean;
        }>(`${environment.apiUrl}/game/current`);
    }

    submitAnswer(questionId: number, selectedAnswer: number) {
        return this.http.post<AnswerResult>(`${environment.apiUrl}/game/answer`, {
            question_id: questionId,
            selected_answer: selectedAnswer,
        });
    }

    advance() {
        return this.http.post<Record<string, unknown>>(`${environment.apiUrl}/game/advance`, {});
    }

    pause() {
        return this.http.post(`${environment.apiUrl}/game/pause`, {});
    }

    restart() {
        return this.http.post(`${environment.apiUrl}/game/restart`, {});
    }

    /** Solo desarrollo: borra progreso de partida. */
    abandonProgress() {
        return this.http.post<{ message: string }>(`${environment.apiUrl}/game/abandon`, {});
    }

    getRanking() {
        return this.http.get<RankingData>(`${environment.apiUrl}/game/ranking`);
    }

    refreshSession() {
        return this.auth.fetchMe();
    }
}
