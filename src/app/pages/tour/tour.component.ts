import { Component, Inject, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { FormControl, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

import { LayoutService } from '../../core/services/layout.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { ToursService } from '../../core/services/tours.service';
import { initializeTour, Tour, TourAssignments } from '../../core/models/tour';
import { TourMembersComponent } from './tour-members/tour-members.component';
import { TourCarsComponent } from './tour-cars/tour-cars.component';
import { TourThingsComponent } from './tour-things/tour-things.component';
import { DragDropService } from '../../core/services/drag-drop.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { WeightPipe } from '../../core/pipes/customPipes';

@Component({
    selector: 'app-adit-tour',
    standalone: true,
    imports: [DatePicker, DatePipe, ReactiveFormsModule, FormsModule, HeaderComponent, MatIconModule, NgClass, NgFor, NgIf, TourCarsComponent, TourMembersComponent, TourThingsComponent, IconComponent, WeightPipe],
    templateUrl: './tour.component.html',
    styleUrl: './tour.component.scss',
})
export class AditTourComponent {
    dragDropService = inject(DragDropService);
    layoutService = inject(LayoutService);
    route = inject(ActivatedRoute);
    tourService = inject(ToursService);

    loading: boolean = false;
    name = new FormControl('');
    dates: Date | undefined;
    tourForm = new FormGroup({
        start: new FormControl(''),
        end: new FormControl(''),
        dates: new FormControl<Date[] | undefined>([]),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        tourMembers: new FormControl(0),
    });
    tour: Tour = initializeTour();
    tourID: number = 0;

    tourMembersCount: number = 0;
    tourCarsCount: number = 0;
    tourThingsCount: number = 0;

    memberForm = new FormGroup({
        avatar: new FormControl(0),
        id: new FormControl(''),
        name: new FormControl('', Validators.required),
    });

    cards = [
        { title: 'Teilnehmer', icon: 'person' },
        { title: 'Gepäck', icon: 'backpack' },
        { title: 'Mitfahrzentrale', icon: 'directions_car' },
    ];
    collapsedCards = [true, true, true];

    private sub: any;
    private assignmentsChanged!: Subscription;

    ngOnInit() {
        this.sub = this.route.params.subscribe((params) => {
            this.tourID = +params['id'];
        });
        this.getTourData(this.tourID);
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);

        this.assignmentsChanged = this.dragDropService.tourAssignmentsChange$.subscribe(() => {
            this.getTourData(this.tourID);
        });
    }

    getTourData(tourID: number) {
        this.loading = true;
        this.tourService
            .get('tours/' + tourID)
            .toPromise()
            .then((response) => {
                console.log('getTourData - success', response);

                this.tour = response;

                this.tourMembersCount = response.tourData.tourMembers.length;
                this.tourCarsCount = response.tourData.tourCars.length;
                this.tourThingsCount = response.tourData.tourThings.length;

                this.tourForm.controls.start.setValue(this.tour.tourData.start);
                this.tourForm.controls.end.setValue(this.tour.tourData.end);
                this.loading = false;
            })
            .catch((error) => {
                console.error('getTourData - error', error);
                this.loading = false;
            });
    }

    toggleCard(index: number) {
        this.collapsedCards[index] = !this.collapsedCards[index];
    }

    isAnyCardOpen(): boolean {
        return this.collapsedCards.some((state) => !state);
    }

    onTourThingsCountChange(count: number) {
        this.tourThingsCount = count;
    }

    onTourMembersCountChange(count: number) {
        this.tourMembersCount = count;
    }

    onTourCarsCountChange(count: number) {
        this.tourCarsCount = count;
    }
}
