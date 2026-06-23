import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DropdownComponent, DropdownOption } from '../../../shared/dropdown/dropdown';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, RouterLink, DropdownComponent],
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

    readonly departmentOptions: DropdownOption<number>[] = [
        { value: 1, label: 'Banknotes' },
        { value: 2, label: 'Communications' },
        { value: 3, label: 'Corporate Services' },
        { value: 4, label: 'Counsel to the Executive Board' },
        { value: 5, label: 'Economics' },
        { value: 6, label: 'ESRB Secretariat' },
        { value: 7, label: 'Executive Board members' },
        { value: 8, label: 'Governance & Transformation Services' },
        { value: 9, label: 'Horizontal Line Supervision' },
        { value: 10, label: 'Human Resources' },
        { value: 11, label: 'Information Systems' },
        { value: 12, label: 'Internal Audit' },
        { value: 13, label: 'International & European Relations' },
        { value: 14, label: 'Legal Services' },
        { value: 15, label: 'Macroprudential Policy & Financial Stability' },
        { value: 16, label: 'Market Infrastructure & Payments' },
        { value: 17, label: 'Market Operations' },
        { value: 18, label: 'Mediation Function' },
        { value: 19, label: 'Monetary Policy' },
        { value: 20, label: 'On-site & Internal Model Inspections' },
        { value: 21, label: 'Organisational Effectiveness Group' },
        { value: 22, label: 'Research' },
        { value: 23, label: 'Risk Management' },
        { value: 24, label: 'Secretariat' },
        { value: 25, label: 'Specialised Institutions & LSIs' },
        { value: 26, label: 'SSM Governance & Operations' },
        { value: 27, label: 'Statistics' },
        { value: 28, label: 'Supervisory Strategy & Risk' },
        { value: 29, label: 'Systemic & International Banks' },
        { value: 30, label: 'Universal & Diversified Institutions' },
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
