import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './verify-email.html',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    email = '';
    code = '';
    error = signal('');
    info = signal('');
    resendCooldown = signal(0);

    private cooldownTimer: ReturnType<typeof setInterval> | null = null;

    constructor(
        private auth: AuthService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    }

    ngOnDestroy() {
        this.clearCooldownTimer();
    }

    submit() {
        if (!this.email) {
            this.error.set('Missing email address.');
            return;
        }

        this.error.set('');
        this.info.set('');
        this.auth.verifyEmail(this.email, this.code).subscribe({
            next: () => this.auth.navigateAfterAuth(),
            error: (err) => {
                const msg = err.error?.errors?.code?.[0]
                    || err.error?.message
                    || 'Verification failed';
                this.error.set(msg);
            },
        });
    }

    resend() {
        if (!this.email || this.resendCooldown() > 0) {
            return;
        }

        this.error.set('');
        this.info.set('');
        this.auth.resendVerificationCode(this.email).subscribe({
            next: (res) => {
                this.info.set(res.message);
                this.startResendCooldown();
            },
            error: (err) => {
                const msg = err.error?.message || 'Could not resend code';
                this.error.set(msg);
            },
        });
    }

    private startResendCooldown() {
        this.resendCooldown.set(60);
        this.clearCooldownTimer();
        this.cooldownTimer = setInterval(() => {
            const next = this.resendCooldown() - 1;
            if (next <= 0) {
                this.resendCooldown.set(0);
                this.clearCooldownTimer();
                return;
            }
            this.resendCooldown.set(next);
        }, 1000);
    }

    private clearCooldownTimer() {
        if (this.cooldownTimer) {
            clearInterval(this.cooldownTimer);
            this.cooldownTimer = null;
        }
    }
}
