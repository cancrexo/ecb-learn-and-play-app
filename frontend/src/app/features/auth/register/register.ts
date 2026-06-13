import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    departmentId: number | '' = '';
    email = '';
    password = '';
    acceptTerms = false;
    error = signal('');

    readonly departments = [
        { id: 1, name: 'Department 1' },
        { id: 2, name: 'Department 2' },
        { id: 3, name: 'Department 3' },
        { id: 4, name: 'Department 4' },
        { id: 5, name: 'Department 5' },
    ];

    constructor(
        private auth: AuthService,
        private router: Router,
    ) {}

    submit() {
        this.error.set('');
        this.auth.register({
            username: this.username,
            department_id: Number(this.departmentId),
            email: this.email,
            password: this.password,
            accept_terms: this.acceptTerms,
        }).subscribe({
            next: () => {
                this.router.navigate(['/verify-email'], {
                    queryParams: { email: this.email },
                });
            },
            error: (err) => {
                const msg = err.error?.errors
                    ? Object.values(err.error.errors).flat().join(' ')
                    : err.error?.message || 'Registration failed';
                this.error.set(msg as string);
            },
        });
    }
}
