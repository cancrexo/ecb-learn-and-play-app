import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {
    email = '';
    token = '';
    password = '';
    passwordConfirmation = '';
    error = signal('');
    linkInvalid = signal(false);

    constructor(
        private auth: AuthService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
        this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

        if (!this.email || !this.token) {
            this.linkInvalid.set(true);
        }
    }

    submit() {
        this.error.set('');
        this.auth.resetPassword(this.email, this.token, this.password, this.passwordConfirmation).subscribe({
            next: () => this.auth.navigateAfterAuth(),
            error: (err) => {
                const msg = err.error?.errors?.token?.[0]
                    || err.error?.errors?.password?.[0]
                    || err.error?.message
                    || 'Password reset failed';
                this.error.set(msg);
            },
        });
    }
}
