import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo';

@Component({
    selector: 'app-instructions',
    standalone: true,
    imports: [RouterLink, BrandLogoComponent],
    templateUrl: './instructions.html',
    styleUrl: './instructions.scss',
})
export class InstructionsComponent {}
