import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GameSession, User } from '../models/game.models';
import { AUTH_TOKEN_KEY } from '../constants/auth.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
    readonly user = signal<User | null>(null);
    readonly gameSession = signal<GameSession | null>(null);

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {
        if (this.getToken()) {
            this.fetchMe().subscribe();
        }
    }

    getToken(): string | null {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }

    register(data: { username: string; email: string; password: string; accept_terms: boolean }) {
        return this.http.post<{ token: string; user: User }>(`${environment.apiUrl}/register`, data).pipe(
            tap((res) => this.handleAuth(res)),
        );
    }

    login(login: string, password: string) {
        return this.http.post<{ token: string; user: User }>(`${environment.apiUrl}/login`, { login, password }).pipe(
            tap((res) => this.handleAuth(res)),
        );
    }

    logout() {
        const req = this.getToken()
            ? this.http.post(`${environment.apiUrl}/logout`, {})
            : null;

        this.clearAuth();

        if (req) {
            req.subscribe({ complete: () => this.router.navigate(['/login']) });
        } else {
            this.router.navigate(['/login']);
        }
    }

    fetchMe() {
        return this.http.get<{ user: User; game_session: GameSession | null }>(`${environment.apiUrl}/me`).pipe(
            tap((res) => {
                this.user.set(res.user);
                this.gameSession.set(res.game_session);
            }),
        );
    }

    isLoggedIn(): boolean {
        return !!this.getToken() && !!this.user();
    }

    private handleAuth(res: { token: string; user: User }) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        this.user.set(res.user);
        this.fetchMe().subscribe();
    }

    private clearAuth() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        this.user.set(null);
        this.gameSession.set(null);
    }
}
