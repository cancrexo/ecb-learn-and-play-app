export const AUTH_TOKEN_KEY = 'elp_token';

export function getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}
