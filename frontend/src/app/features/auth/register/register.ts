import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.scss',
})
export class RegisterComponent {
    username = '';
    email = '';
    password = '';
    acceptTerms = false;
    error = signal('');

    constructor(private auth: AuthService) {}

    submit() {
        this.error.set('');
        this.auth.register({
            username: this.username,
            email: this.email,
            password: this.password,
            accept_terms: this.acceptTerms,
        }).subscribe({
            next: () => this.auth.navigateAfterAuth(),
            error: (err) => {
                const msg = err.error?.errors
                    ? Object.values(err.error.errors).flat().join(' ')
                    : err.error?.message || 'Registration failed';
                this.error.set(msg as string);
            },
        });
    }
}
