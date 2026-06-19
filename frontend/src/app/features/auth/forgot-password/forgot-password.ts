import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
    email = '';
    error = signal('');
    info = signal('');
    sent = signal(false);

    constructor(private auth: AuthService) {}

    submit() {
        this.error.set('');
        this.info.set('');
        this.auth.requestPasswordReset(this.email).subscribe({
            next: (res) => {
                this.sent.set(true);
                this.info.set(res.message);
            },
            error: (err) => {
                const msg = err.error?.message || 'Could not send reset link';
                this.error.set(msg);
            },
        });
    }
}
