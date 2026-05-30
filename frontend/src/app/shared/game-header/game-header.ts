import { Component, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-game-header',
    standalone: true,
    templateUrl: './game-header.html',
    styleUrl: './game-header.scss',
})
export class GameHeaderComponent {
    @Input({ required: true }) score = 0;

    constructor(protected auth: AuthService) {}
}
