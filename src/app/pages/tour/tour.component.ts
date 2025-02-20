import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { FormControl, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { LayoutService } from '../../core/services/layout.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { ToursService } from '../../core/services/tours.service';
import { initializeTour, Tour } from '../../core/models/tour';
import { TourMembersComponent } from './tour-members/tour-members.component';
import { TourCarsComponent } from './tour-cars/tour-cars.component';
import { TourThingsComponent } from "./tour-things/tour-things.component";

@Component({
    selector: 'app-adit-tour',
    standalone: true,
    imports: [
    DatePicker,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    MatIconModule,
    NgClass,
    NgFor,
    NgIf,
    TourCarsComponent,
    TourMembersComponent,
    TourThingsComponent
],
    templateUrl: './tour.component.html',
    styleUrl: './tour.component.scss',
})
export class AditTourComponent {
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
    });
    tour: Tour = initializeTour();
    tourID: number = 0;

    memberForm = new FormGroup({
        avatar: new FormControl(0),
        id: new FormControl(''),
        name: new FormControl('', Validators.required),
    });

    cards = [{ title: 'Teilnehmer', icon: 'person'},{ title: 'Gepäck', icon: 'backpack'},{ title: 'Mitfahrzentrale', icon: 'directions_car'}]
    collapsedCards = [false, true, true];

    private sub: any;

    

    ngOnInit() {
        this.sub = this.route.params.subscribe((params) => {
            this.tourID = +params['id'];
        });
        this.getTourData(this.tourID);
        this.layoutService.setTopbarState('visible');
        this.layoutService.setFooterState('visible');
        this.layoutService.setBackgroundBlurred(true);
    }

    getTourData(tourID: number) {
        this.tourService
            .get('tour/' + tourID)
            .toPromise()
            .then((response) => {
                console.log('getTourData - success', response.tour);

                this.tour = response.tour

                // this.tour.tourCars = this.tourCars
                // this.tour.tourData = this.tourData
                // this.tour.tourParticipants = this.tourParticipants
                // this.tour.tourThings = this.tourThings
                
                this.tourForm.controls.start.setValue(
                    this.tour.tour_data.start
                );
                this.tourForm.controls.end.setValue(this.tour.tour_data.end);
                // this.tourForm.controls.arrivalChecked.setValue(this.tourData.arrivalChecked)
                // this.tourForm.controls.departureChecked.setValue(this.tourData.departureChecked)

                // this.geocoder.geocode({

                //     address: this.tourData.destination

                // }).subscribe(({results}) => {
                //     console.log(results);
                //     console.log('laatitude:  ',results[0].geometry.location.lat());
                //     console.log('logitude:  ',results[0].geometry.location.lng());

                //     this.center = {
                //         lat: results[0].geometry.location.lat(),
                //         lng: results[0].geometry.location.lng(),
                //       };
                // });

                // this.tourMeals = response.meals;
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
}
