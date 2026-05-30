import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-instructions',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './instructions.html',
    styleUrl: './instructions.scss',
})
export class InstructionsComponent {}
