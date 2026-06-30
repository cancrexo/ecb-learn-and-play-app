import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-splash1',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './splash1.html',
    styleUrl: './splash1.scss',
})
export class Splash1Component implements OnInit, OnDestroy {
    private http = inject(HttpClient);

    version = signal<string | null>(null);

    ngOnInit() {
        document.body.classList.add('splash1-route');
        this.http.get<{ version: string }>(`${environment.apiUrl}/version`).subscribe({
            next: (res) => this.version.set(res.version),
        });
    }

    ngOnDestroy() {
        document.body.classList.remove('splash1-route');
    }
}
