import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './login.html',
})
export class LoginComponent {
    login = '';
    password = '';
    error = signal('');

    constructor(
        private auth: AuthService,
        private router: Router,
    ) {}

    submit() {
        this.error.set('');
        this.auth.login(this.login, this.password).subscribe({
            next: () => this.auth.navigateAfterAuth(),
            error: (err) => {
                if (err.error?.email_verification_required && err.error?.email) {
                    this.router.navigate(['/verify-email'], {
                        queryParams: { email: err.error.email },
                    });
                    return;
                }

                const msg = err.error?.errors?.login?.[0]
                    || err.error?.message
                    || 'Login failed';
                this.error.set(msg);
            },
        });
    }
}
