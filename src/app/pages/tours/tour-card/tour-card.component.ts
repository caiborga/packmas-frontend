import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
    initializeTour,
    Tour,
} from '../../../core/models/tour';
import { RouterModule } from '@angular/router';
import { WeightPipe } from '../../../core/pipes/customPipes';
import { Member } from '../../../core/models/member';

@Component({
    selector: 'app-tour-card',
    standalone: true,
    imports: [DatePipe, MatIconModule, RouterModule, WeightPipe],
    templateUrl: './tour-card.component.html',
    styleUrl: './tour-card.component.scss',
})
export class TourCardComponent {
    @Input() tour: Tour = initializeTour();
    @Input() loading: boolean = true;
    @Output() onDelete = new EventEmitter<Tour>();

    ngOnInit() {
        console.log('TourCardComponent - tour', this.tour )
    }

    getAvatar(member: Member) {
        return 'assets/images/avatars/' + member.avatar + 'thumbnail.jpg'
    }
}
