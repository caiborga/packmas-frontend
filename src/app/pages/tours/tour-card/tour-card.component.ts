import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
    initializeTour,
    Tour,
} from '../../../core/models/tour';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-tour-card',
    standalone: true,
    imports: [MatIconModule, RouterModule],
    templateUrl: './tour-card.component.html',
    styleUrl: './tour-card.component.scss',
})
export class TourCardComponent {
    @Input() tour: Tour = initializeTour();
    @Input() loading: boolean = true;
    @Output() onDelete = new EventEmitter<Tour>();
}
