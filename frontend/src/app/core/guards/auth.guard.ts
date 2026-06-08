import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn()) {
        return true;
    }

    return auth.fetchMe().pipe(
        map(() => true),
        catchError(() => {
            auth.clearInvalidSession();
            router.navigate(['/login']);
            return of(false);
        }),
    );
};

export const guestGuard: CanActivateFn = () => {
    const auth = inject(AuthService);

    if (!auth.getToken()) {
        return true;
    }

    if (auth.isLoggedIn()) {
        auth.navigateAfterAuth();
        return false;
    }

    return auth.fetchMe().pipe(
        map(() => {
            auth.navigateAfterAuth();
            return false;
        }),
        catchError(() => {
            // Token inválido: limpiar y mostrar login (no re-navegar a /login → bucle infinito)
            auth.clearInvalidSession();
            return of(true);
        }),
    );
};
