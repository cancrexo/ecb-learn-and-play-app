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
        { id: 1, name: 'Banknotes' },
        { id: 2, name: 'Communications' },
        { id: 3, name: 'Corporate Services' },
        { id: 4, name: 'Counsel to the Executive Board' },
        { id: 5, name: 'Economics' },
        { id: 6, name: 'ESRB Secretariat' },
        { id: 7, name: 'Executive Board members' },
        { id: 8, name: 'Governance & Transformation Services' },
        { id: 9, name: 'Horizontal Line Supervision' },
        { id: 10, name: 'Human Resources' },
        { id: 11, name: 'Information Systems' },
        { id: 12, name: 'Internal Audit' },
        { id: 13, name: 'International & European Relations' },
        { id: 14, name: 'Legal Services' },
        { id: 15, name: 'Macroprudential Policy & Financial Stability' },
        { id: 16, name: 'Market Infrastructure & Payments' },
        { id: 17, name: 'Market Operations' },
        { id: 18, name: 'Mediation Function' },
        { id: 19, name: 'Monetary Policy' },
        { id: 20, name: 'On-site & Internal Model Inspections' },
        { id: 21, name: 'Organisational Effectiveness Group' },
        { id: 22, name: 'Research' },
        { id: 23, name: 'Risk Management' },
        { id: 24, name: 'Secretariat' },
        { id: 25, name: 'Specialised Institutions & LSIs' },
        { id: 26, name: 'SSM Governance & Operations' },
        { id: 27, name: 'Statistics' },
        { id: 28, name: 'Supervisory Strategy & Risk' },
        { id: 29, name: 'Systemic & International Banks' },
        { id: 30, name: 'Universal & Diversified Institutions' },
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
