import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../../../shared/brand-logo/brand-logo';

@Component({
    selector: 'app-splash1',
    standalone: true,
    imports: [RouterLink, BrandLogoComponent],
    templateUrl: './splash1.html',
    styleUrl: './splash1.scss',
})
export class Splash1Component {}
