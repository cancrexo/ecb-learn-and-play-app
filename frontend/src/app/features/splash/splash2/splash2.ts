import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../../../shared/brand-logo/brand-logo';

@Component({
    selector: 'app-splash2',
    standalone: true,
    imports: [RouterLink, BrandLogoComponent],
    templateUrl: './splash2.html',
    styleUrl: './splash2.scss',
})
export class Splash2Component {}
