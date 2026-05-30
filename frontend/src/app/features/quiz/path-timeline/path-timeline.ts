import { Component, Input } from '@angular/core';
import { TimelineItem } from '../../../core/models/game.models';

@Component({
    selector: 'app-path-timeline',
    standalone: true,
    templateUrl: './path-timeline.html',
    styleUrl: './path-timeline.scss',
})
export class PathTimelineComponent {
    @Input({ required: true }) items: TimelineItem[] = [];
}
