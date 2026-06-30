import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GameSession, User } from '../models/game.models';
import { AUTH_TOKEN_KEY } from '../constants/auth.constants';

export interface RegisterResponse {
    message: string;
    email: string;
    email_verification_required: boolean;
}

export interface ResendVerificationResponse {
    message: string;
}

export interface PasswordResetRequestResponse {
    message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    readonly user = signal<User | null>(null);
    readonly gameSession = signal<GameSession | null>(null);

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {
        if (this.getToken()) {
            this.fetchMe().subscribe({ error: () => this.clearInvalidSession() });
        }
    }

    getToken(): string | null {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }

    register(data: {
        username: string;
        department_id: number;
        email: string;
        password: string;
        accept_data_protection: boolean;
    }) {
        return this.http.post<RegisterResponse>(`${environment.apiUrl}/register`, data);
    }

    verifyEmail(email: string, code: string) {
        return this.http.post<{ token: string; user: User }>(`${environment.apiUrl}/verify-email`, { email, code }).pipe(
            tap((res) => this.storeAuthToken(res)),
            switchMap(() => this.fetchMe()),
        );
    }

    resendVerificationCode(email: string) {
        return this.http.post<ResendVerificationResponse>(`${environment.apiUrl}/resend-verification-code`, { email });
    }

    requestPasswordReset(email: string) {
        return this.http.post<PasswordResetRequestResponse>(`${environment.apiUrl}/forgot-password`, { email });
    }

    resetPassword(email: string, token: string, password: string, passwordConfirmation: string) {
        return this.http.post<{ token: string; user: User }>(`${environment.apiUrl}/reset-password`, {
            email,
            token,
            password,
            password_confirmation: passwordConfirmation,
        }).pipe(
            tap((res) => this.storeAuthToken(res)),
            switchMap(() => this.fetchMe()),
        );
    }

    login(login: string, password: string) {
        return this.http.post<{ token: string; user: User }>(`${environment.apiUrl}/login`, { login, password }).pipe(
            tap((res) => this.storeAuthToken(res)),
            switchMap(() => this.fetchMe()),
        );
    }

    logout(options?: { redirectTo?: string | string[]; reload?: boolean }) {
        const redirectTo = options?.redirectTo ?? '/login';
        const reload = options?.reload ?? false;

        const req = this.getToken()
            ? this.http.post(`${environment.apiUrl}/logout`, {})
            : null;

        this.clearAuth();

        const finish = () => {
            if (reload) {
                window.location.href = typeof redirectTo === 'string' ? redirectTo : `/${redirectTo.join('/').replace(/^\/+/, '')}`;
                return;
            }

            const commands = Array.isArray(redirectTo) ? redirectTo : [redirectTo];
            this.router.navigate(commands);
        };

        if (req) {
            req.subscribe({ complete: finish, error: finish });
        } else {
            finish();
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

    /** Limpia sesión local cuando el token ya no es válido. */
    clearInvalidSession(): void {
        this.clearAuth();
    }

    isLoggedIn(): boolean {
        return !!this.getToken() && !!this.user();
    }

    /** Navega según el estado de la partida tras autenticación. */
    navigateAfterAuth(): void {
        const session = this.gameSession();

        if (!session) {
            this.router.navigate(['/instructions']);
            return;
        }

        if (session.status === 'completed') {
            this.router.navigate(['/game-over']);
            return;
        }

        if (
            (session.status === 'in_progress' || session.status === 'paused') &&
            session.current_question_id &&
            session.current_cluster_id
        ) {
            this.router.navigate(['/quiz', session.current_cluster_id]);
            return;
        }

        if (session.status === 'in_progress' || session.status === 'paused') {
            this.router.navigate(['/clusters']);
            return;
        }

        this.router.navigate(['/instructions']);
    }

    private storeAuthToken(res: { token: string; user: User }) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        this.user.set(res.user);
    }

    private clearAuth() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        this.user.set(null);
        this.gameSession.set(null);
    }
}
