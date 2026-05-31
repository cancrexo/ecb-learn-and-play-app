import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class LoginComponent {
    login = '';
    password = '';
    error = signal('');

    constructor(private auth: AuthService) {}

    submit() {
        this.error.set('');
        this.auth.login(this.login, this.password).subscribe({
            next: () => this.auth.navigateAfterAuth(),
            error: (err) => {
                const msg = err.error?.errors?.login?.[0]
                    || err.error?.message
                    || 'Login failed';
                this.error.set(msg);
            },
        });
    }
}
