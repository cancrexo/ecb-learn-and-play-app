import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-splash1',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './splash1.html',
    styleUrl: './splash1.scss',
})
export class Splash1Component implements OnInit, OnDestroy {
    ngOnInit() {
        document.body.classList.add('splash1-route');
    }

    ngOnDestroy() {
        document.body.classList.remove('splash1-route');
    }
}
