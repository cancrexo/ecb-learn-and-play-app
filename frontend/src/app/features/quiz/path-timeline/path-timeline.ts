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
    /** Id del cluster en juego (coincide con el orden del timeline: 1–4). */
    @Input() activeClusterId: number | null = null;

    /** Agrupa los dots de 4 en 4 (un cluster por grupo). */
    get groups(): TimelineItem[][] {
        const size = 4;
        const result: TimelineItem[][] = [];
        for (let i = 0; i < this.items.length; i += size) {
            result.push(this.items.slice(i, i + size));
        }
        return result;
    }

    isClusterActive(groupIndex: number): boolean {
        return this.activeClusterId !== null && groupIndex + 1 === this.activeClusterId;
    }
}
