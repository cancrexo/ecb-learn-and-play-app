import { HttpInterceptorFn } from '@angular/common/http';
import { getAuthToken } from '../constants/auth.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = getAuthToken();

    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }

    return next(req);
};
